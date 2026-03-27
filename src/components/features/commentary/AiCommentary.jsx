"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, X, Sparkles, Play, Loader2, Volume2, VolumeX, Radio } from "lucide-react";
import { useWebRTCStore } from "@/context/webrtc/WebRTCContext";
import { useReceiveFileData } from "@/context/ReceiveFileDataContext";
import { useSendFileData } from "@/context/SendFileDataContext";

const MODES = [
  { id: "professional", label: "Professional", emoji: "💼", description: "Corporate boardroom tone" },
  { id: "casual",       label: "Casual",       emoji: "😎", description: "Chill and relaxed" },
  { id: "roast",        label: "Roast",        emoji: "🔥", description: "Burns & savage takes" },
  { id: "sarcasm",      label: "Sarcasm",      emoji: "😏", description: "Eye-rolling wit" },
  { id: "cricket",      label: "Cricket",      emoji: "🏏", description: "Live IPL commentary" },
  { id: "epic",         label: "Epic",         emoji: "🌌", description: "Cinematic narrator" },
  { id: "news",         label: "News",         emoji: "📺", description: "Breaking news bulletin" },
];

// Web Speech API voice settings per mode (rate + pitch)
const VOICE_SETTINGS = {
  professional: { rate: 0.95, pitch: 0.9  },
  casual:       { rate: 1.05, pitch: 1.0  },
  roast:        { rate: 1.1,  pitch: 1.05 },
  sarcasm:      { rate: 0.9,  pitch: 0.85 },
  cricket:      { rate: 1.25, pitch: 1.1  },
  epic:         { rate: 0.82, pitch: 0.75 },
  news:         { rate: 1.05, pitch: 1.0  },
};

/** At this fraction of text read, start fetching the next live segment */
const PREFETCH_AT_PROGRESS = 0.65;

/** Fallback prefetch timer (ms) — triggered if onboundary is unreliable in this browser */
const PREFETCH_FALLBACK_DELAY_MS = 8000;

/** Rotation interval (ms) when Web Speech API is unavailable (text-only fallback) */
const TEXT_ONLY_INTERVAL_MS = 15000;

/** Retry delay (ms) before advancing after a speech error */
const AUDIO_ERROR_RETRY_DELAY_MS = 1500;

/** Heartbeat interval (ms) to keep Chrome's speech synthesis from auto-pausing */
const CHROME_SYNTHESIS_KEEPALIVE_MS = 14000;

export default function AiCommentary({ uploadSpeed = 0 }) {
  const [isOpen, setIsOpen]             = useState(false);
  const [selectedMode, setSelectedMode] = useState("casual");
  const [commentary, setCommentary]     = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [audioError, setAudioError]     = useState("");
  const [genError, setGenError]         = useState("");
  // Live mode
  const [isLive, setIsLive]         = useState(false);
  const [liveStatus, setLiveStatus] = useState(""); // "fetching" | "playing"
  const [liveError, setLiveError]   = useState("");

  const utteranceRef       = useRef(null);
  const textOnlyTimerRef   = useRef(null);
  const speechResumeRef    = useRef(null);  // heartbeat keeps Chrome from pausing synthesis
  const prefetchTimerRef   = useRef(null);  // fallback prefetch timer
  // Live-loop control refs — readable from any async callback without stale-closure risk
  const isLiveRef          = useRef(false);
  const nextTextRef        = useRef(null);  // pre-fetched next commentary text
  const prefetchingRef     = useRef(false);
  const prefetchPromiseRef = useRef(null);
  // Always-fresh pointers updated on every render
  const buildContextRef    = useRef(null);
  const selectedModeRef    = useRef(selectedMode);

  const { connectionState, connectionType } = useWebRTCStore();
  const { files: receivedFiles, downloadSpeed } = useReceiveFileData();
  const { selectedFiles } = useSendFileData();

  const buildContext = () => ({
    connectionState,
    connectionType,
    downloadSpeed,
    uploadSpeed,
    totalFiles: receivedFiles.length + selectedFiles.length,
    fileNames: [
      ...receivedFiles.map((f) => f.name || f.file?.name || "unknown"),
      ...selectedFiles.map((f) => f.file?.name || "unknown"),
    ],
    clientTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  });

  // Keep refs fresh so async live-loop callbacks always see latest state
  buildContextRef.current = buildContext;
  selectedModeRef.current = selectedMode;

  // Stop all speech on unmount
  useEffect(() => {
    return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Shared helpers ────────────────────────────────────────────────────────

  const fetchCommentaryText = async (mode, ctx) => {
    const res = await fetch("/api/ai-commentary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, ...ctx }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate commentary");
    return data.text;
  };

  const clearSpeechResumeTimer = () => {
    if (speechResumeRef.current) {
      clearInterval(speechResumeRef.current);
      speechResumeRef.current = null;
    }
  };

  /**
   * Speak text using the browser's built-in Web Speech API (no API key required).
   * Returns false if the API is unavailable in this environment.
   * onProgress — called when ~65% of the text has been spoken
   * onEnd      — called when speech finishes naturally
   * onError    — called on unexpected errors (not on intentional cancel)
   */
  const speakText = (text, mode, { onProgress, onEnd, onError } = {}) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return false;

    // Cancel any in-progress speech before starting a new one
    window.speechSynthesis.cancel();

    const settings  = VOICE_SETTINGS[mode] || { rate: 1.0, pitch: 1.0 };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = settings.rate;
    utterance.pitch = settings.pitch;

    // Prefer en-IN, then en-GB (great for cricket commentary), then any English
    const voices = window.speechSynthesis.getVoices();
    const voice  =
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null;
    if (voice) utterance.voice = voice;

    let progressFired = false;
    utterance.onboundary = (event) => {
      if (!progressFired && onProgress && text.length > 0) {
        if (event.charIndex / text.length >= PREFETCH_AT_PROGRESS) {
          progressFired = true;
          onProgress();
        }
      }
    };

    utterance.onend = () => {
      clearSpeechResumeTimer();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      // "interrupted" fires when we intentionally call cancel() — not a real error
      if (e.error === "interrupted") return;
      clearSpeechResumeTimer();
      if (onError) onError();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    // Heartbeat: Chrome pauses synthesis after ~15 s; keep it alive with pause/resume
    clearSpeechResumeTimer();
    speechResumeRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, CHROME_SYNTHESIS_KEEPALIVE_MS);

    return true;
  };

  // ── Single-shot mode ──────────────────────────────────────────────────────

  const stopAudio = () => {
    clearSpeechResumeTimer();
    if (prefetchTimerRef.current)  { clearTimeout(prefetchTimerRef.current);  prefetchTimerRef.current  = null; }
    if (textOnlyTimerRef.current)  { clearTimeout(textOnlyTimerRef.current);  textOnlyTimerRef.current  = null; }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
  };

  const generateCommentary = async () => {
    if (isLiveRef.current) stopLiveCommentary();
    setIsGenerating(true);
    setGenError("");
    setCommentary("");
    stopAudio();
    try {
      const text = await fetchCommentaryText(selectedMode, buildContext());
      setCommentary(text);
    } catch (e) {
      setGenError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const playCommentary = () => {
    if (!commentary) return;
    if (isPlaying) { stopAudio(); return; }
    setAudioError("");
    const ok = speakText(commentary, selectedMode, {
      onEnd:   () => setIsPlaying(false),
      onError: () => { setIsPlaying(false); setAudioError("Speech synthesis failed. Check browser permissions."); },
    });
    if (!ok) {
      setAudioError("Web Speech API is not supported in this browser.");
      return;
    }
    setIsPlaying(true);
  };

  // ── Live commentary ───────────────────────────────────────────────────────

  /**
   * Silently pre-fetch the next commentary text in the background.
   * Only the Groq call is needed — speech synthesis happens client-side.
   */
  const triggerPrefetch = () => {
    if (prefetchingRef.current || nextTextRef.current) return;
    prefetchingRef.current = true;
    const mode = selectedModeRef.current;
    const ctx  = buildContextRef.current();
    prefetchPromiseRef.current = (async () => {
      try {
        const text = await fetchCommentaryText(mode, ctx);
        if (isLiveRef.current) nextTextRef.current = text;
      } catch {
        // Non-fatal: advanceLive will fetch fresh when the current segment ends
      } finally {
        prefetchingRef.current     = false;
        prefetchPromiseRef.current = null;
      }
    })();
  };

  /**
   * Speak one live segment.  Wires up the progress-based pre-fetch trigger
   * (via onboundary) and the onend auto-advance so the stream is seamless.
   */
  const playLiveSegment = (text) => {
    if (!isLiveRef.current) return;
    setCommentary(text);
    setLiveStatus("playing");

    if (typeof window === "undefined" || !window.speechSynthesis) {
      // Text-only fallback when Web Speech API is unavailable
      setIsPlaying(false);
      textOnlyTimerRef.current = setTimeout(() => {
        if (isLiveRef.current) advanceLive();
      }, TEXT_ONLY_INTERVAL_MS);
      return;
    }

    let prefetchFired = false;

    // Fallback timer: trigger prefetch if onboundary doesn't fire (e.g., Firefox)
    prefetchTimerRef.current = setTimeout(() => {
      if (!prefetchFired) { prefetchFired = true; triggerPrefetch(); }
    }, PREFETCH_FALLBACK_DELAY_MS);

    const clearPrefetchTimer = () => {
      if (prefetchTimerRef.current) { clearTimeout(prefetchTimerRef.current); prefetchTimerRef.current = null; }
    };

    speakText(text, selectedModeRef.current, {
      onProgress: () => {
        if (!prefetchFired) {
          prefetchFired = true;
          clearPrefetchTimer();
          triggerPrefetch();
        }
      },
      onEnd: () => {
        clearPrefetchTimer();
        if (!isLiveRef.current) { setIsPlaying(false); return; }
        advanceLive();
      },
      onError: () => {
        clearPrefetchTimer();
        setIsPlaying(false);
        if (isLiveRef.current) setTimeout(() => { if (isLiveRef.current) advanceLive(); }, AUDIO_ERROR_RETRY_DELAY_MS);
      },
    });

    setIsPlaying(true);
  };

  /**
   * Move to the next live segment.
   * Priority: ① pre-fetched text ready → speak immediately (near-zero gap)
   *           ② in-flight pre-fetch → await it then speak
   *           ③ fetch fresh (pre-fetch wasn't triggered or failed)
   */
  const advanceLive = async () => {
    if (!isLiveRef.current) return;
    setLiveStatus("fetching");

    // ① Pre-fetch already landed
    if (nextTextRef.current) {
      const text = nextTextRef.current;
      nextTextRef.current = null;
      playLiveSegment(text);
      return;
    }

    // ② Await in-flight pre-fetch
    if (prefetchPromiseRef.current) {
      await prefetchPromiseRef.current;
      if (nextTextRef.current && isLiveRef.current) {
        const text = nextTextRef.current;
        nextTextRef.current = null;
        playLiveSegment(text);
        return;
      }
    }

    // ③ Fetch fresh
    if (!isLiveRef.current) return;
    try {
      const mode = selectedModeRef.current;
      const ctx  = buildContextRef.current();
      const text = await fetchCommentaryText(mode, ctx);
      if (!isLiveRef.current) return;
      playLiveSegment(text);
    } catch (e) {
      if (isLiveRef.current) {
        setLiveError(`Live stopped: ${e.message}`);
        stopLiveCommentary();
      }
    }
  };

  const startLiveCommentary = async () => {
    isLiveRef.current          = true;
    setIsLive(true);
    setLiveError("");
    setLiveStatus("fetching");
    nextTextRef.current        = null;
    prefetchingRef.current     = false;
    prefetchPromiseRef.current = null;
    stopAudio();
    setCommentary("");
    setGenError("");
    try {
      const mode = selectedModeRef.current;
      const ctx  = buildContextRef.current();
      const text = await fetchCommentaryText(mode, ctx);
      if (!isLiveRef.current) return;
      playLiveSegment(text);
    } catch (e) {
      setLiveError(e.message);
      isLiveRef.current = false;
      setIsLive(false);
      setLiveStatus("");
    }
  };

  const stopLiveCommentary = () => {
    isLiveRef.current          = false;
    nextTextRef.current        = null;
    prefetchPromiseRef.current = null;
    prefetchingRef.current     = false;
    setIsLive(false);
    setLiveStatus("");
    stopAudio();
  };

  const activeMode = MODES.find((m) => m.id === selectedMode);

  return (
    <div className="fixed bottom-24 left-6 z-50 flex flex-col items-start">
      {/* Commentary Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-pink-600">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">AI Commentary</span>
              {isLive && (
                <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                if (isLiveRef.current) stopLiveCommentary(); else stopAudio();
              }}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Mode Selector */}
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Select Mode
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      // In live mode the new mode takes effect on the next segment automatically
                      if (!isLive) { setCommentary(""); setGenError(""); stopAudio(); }
                    }}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      selectedMode === mode.id
                        ? "bg-violet-100 dark:bg-violet-900/40 border-violet-400 dark:border-violet-600 text-violet-700 dark:text-violet-300"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-700"
                    }`}
                  >
                    <span className="mr-1">{mode.emoji}</span>
                    {mode.label}
                    <span className="block text-[10px] opacity-60 mt-0.5">{mode.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Single-shot generate */}
              <button
                onClick={generateCommentary}
                disabled={isGenerating || isLive}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate {activeMode?.emoji}</>
                )}
              </button>

              {/* Live toggle */}
              <button
                onClick={isLive ? stopLiveCommentary : startLiveCommentary}
                disabled={isGenerating}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                  isLive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "border-2 border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                }`}
              >
                {isLive && liveStatus === "fetching" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Fetching…</>
                ) : isLive ? (
                  <><Radio className="w-4 h-4" /> Stop Live</>
                ) : (
                  <><Radio className="w-4 h-4" /> Go Live</>
                )}
              </button>
            </div>

            {/* Errors */}
            {genError && !isLive && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center">{genError}</p>
            )}
            {liveError && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center">{liveError}</p>
            )}

            {/* Commentary Output */}
            {commentary && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-3">
                {isLive && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">
                      {liveStatus === "fetching" ? "Preparing next…" : "Now Playing"}
                    </span>
                  </div>
                )}
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{commentary}</p>

                {/* Hear it / Again — only in single-shot mode */}
                {!isLive && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={playCommentary}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                      aria-label={isPlaying ? "Stop voice" : "Play voice"}
                    >
                      {isPlaying ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      {isPlaying ? "Stop" : "Hear it"}
                    </button>

                    <button
                      onClick={generateCommentary}
                      disabled={isGenerating}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" /> Again
                    </button>
                  </div>
                )}

                {audioError && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">{audioError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB Toggle Button */}
      <button
        onClick={() => {
          setIsOpen((o) => {
            if (o) { if (isLiveRef.current) stopLiveCommentary(); else stopAudio(); }
            return !o;
          });
        }}
        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Toggle AI Commentary"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        {isLive && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 border-2 border-white animate-pulse" />
        )}
      </button>
    </div>
  );
}

