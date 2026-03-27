"use client";

import { useState, useRef } from "react";
import { Mic, X, Sparkles, Play, Loader2, Volume2, VolumeX, Radio } from "lucide-react";
import { useWebRTCStore } from "@/context/webrtc/WebRTCContext";
import { useReceiveFileData } from "@/context/ReceiveFileDataContext";
import { useSendFileData } from "@/context/SendFileDataContext";

const MODES = [
  { id: "professional", label: "Professional", emoji: "💼", description: "Corporate boardroom tone" },
  { id: "casual",       label: "Casual",       emoji: "😎", description: "Chill and relaxed" },
  { id: "roast",        label: "Roast",        emoji: "🔥", description: "Burns & savage takes" },
  { id: "sarcasm",      label: "Sarcasm",      emoji: "😏", description: "Eye-rolling wit" },
  { id: "cricket",      label: "Cricket",      emoji: "🏏", description: "Live match commentary" },
  { id: "epic",         label: "Epic",         emoji: "🌌", description: "Cinematic narrator" },
  { id: "news",         label: "News",         emoji: "📺", description: "Breaking news bulletin" },
];

// Sarvam AI speakers and their paces per mode
const SPEAKER_SETTINGS = {
  professional: { speaker: "meera",  pace: 0.9  },
  casual:       { speaker: "arvind", pace: 1.1  },
  roast:        { speaker: "arvind", pace: 1.15 },
  sarcasm:      { speaker: "meera",  pace: 0.95 },
  cricket:      { speaker: "arvind", pace: 1.3  },
  epic:         { speaker: "meera",  pace: 0.8  },
  news:         { speaker: "meera",  pace: 1.0  },
};

/** Start pre-fetching the next live segment this many seconds before the current one ends */
const PREFETCH_BEFORE_END_SECS = 3;

/** Rotation interval (ms) for text-only live mode when no Sarvam key is present */
const TEXT_ONLY_INTERVAL_MS = 15000;

/** Retry delay (ms) before advancing after an audio playback error */
const AUDIO_ERROR_RETRY_DELAY_MS = 1500;

export default function AiCommentary({ uploadSpeed = 0 }) {
  const [isOpen, setIsOpen]             = useState(false);
  const [selectedMode, setSelectedMode] = useState("casual");
  const [commentary, setCommentary]     = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [audioError, setAudioError]     = useState("");
  const [genError, setGenError]         = useState("");
  // Live mode
  const [isLive, setIsLive]         = useState(false);
  const [liveStatus, setLiveStatus] = useState(""); // "fetching" | "playing"
  const [liveError, setLiveError]   = useState("");

  const audioRef           = useRef(null);
  const textOnlyTimerRef   = useRef(null);
  // Live-loop control refs — readable from any async callback without stale-closure risk
  const isLiveRef          = useRef(false);
  const nextSegmentRef     = useRef(null);   // { text, url } — pre-fetched next segment
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

  const fetchTTSUrl = async (text, mode) => {
    const settings = SPEAKER_SETTINGS[mode] || { speaker: "meera", pace: 1.0 };
    const res = await fetch("/api/ai-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, ...settings }),
    });
    const data = await res.json();
    if (!res.ok) return null; // TTS unavailable — caller falls back to text-only
    const binary = atob(data.audio);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
  };

  // ── Single-shot mode ──────────────────────────────────────────────────────

  const stopAudio = () => {
    if (textOnlyTimerRef.current) {
      clearTimeout(textOnlyTimerRef.current);
      textOnlyTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
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

  const playCommentary = async () => {
    if (!commentary) return;
    if (isPlaying) { stopAudio(); return; }
    setIsLoadingAudio(true);
    setAudioError("");
    try {
      const url = await fetchTTSUrl(commentary, selectedMode);
      if (!url) {
        setAudioError("🔑 Add SARVAM_API_KEY to your .env.local to enable voice");
        return;
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsPlaying(false); setAudioError("Playback error"); };
      audio.play();
      setIsPlaying(true);
    } catch (e) {
      setAudioError(e.message);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // ── Live commentary ───────────────────────────────────────────────────────

  /**
   * Silently pre-fetch the next live segment in the background.
   * Called ~PREFETCH_BEFORE_END_SECS seconds before the current audio ends.
   */
  const triggerPrefetch = () => {
    if (prefetchingRef.current || nextSegmentRef.current) return;
    prefetchingRef.current = true;
    const mode = selectedModeRef.current;
    const ctx  = buildContextRef.current();
    prefetchPromiseRef.current = (async () => {
      try {
        const text = await fetchCommentaryText(mode, ctx);
        const url  = await fetchTTSUrl(text, mode);
        if (isLiveRef.current) {
          nextSegmentRef.current = { text, url };
        } else if (url) {
          URL.revokeObjectURL(url);
        }
      } catch {
        // Non-fatal: advanceLive will fetch fresh when the current segment ends
      } finally {
        prefetchingRef.current     = false;
        prefetchPromiseRef.current = null;
      }
    })();
  };

  /**
   * Play one live segment.  Wires up the time-based pre-fetch trigger and
   * the onended auto-advance so the stream is seamless.
   */
  const playLiveSegment = (text, url) => {
    if (!isLiveRef.current) return;
    setCommentary(text);
    setLiveStatus("playing");

    if (!url) {
      // Text-only fallback when Sarvam key is absent
      setIsPlaying(false);
      textOnlyTimerRef.current = setTimeout(() => {
        if (isLiveRef.current) advanceLive();
      }, TEXT_ONLY_INTERVAL_MS);
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);

    audio.ontimeupdate = () => {
      if (!audio.duration) return;
      if (audio.duration - audio.currentTime <= PREFETCH_BEFORE_END_SECS) {
        triggerPrefetch();
      }
    };

    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (!isLiveRef.current) { setIsPlaying(false); return; }
      advanceLive();
    };

    audio.onerror = () => {
      setIsPlaying(false);
      if (isLiveRef.current) setTimeout(() => { if (isLiveRef.current) advanceLive(); }, AUDIO_ERROR_RETRY_DELAY_MS);
    };

    audio.play();
  };

  /**
   * Move to the next live segment.
   * Priority: ① pre-fetched segment already ready → play immediately (zero gap)
   *           ② in-flight pre-fetch → await it then play
   *           ③ fetch fresh (pre-fetch wasn't triggered or failed)
   */
  const advanceLive = async () => {
    if (!isLiveRef.current) return;
    setLiveStatus("fetching");

    // ① Pre-fetch already landed
    if (nextSegmentRef.current) {
      const { text, url } = nextSegmentRef.current;
      nextSegmentRef.current = null;
      playLiveSegment(text, url);
      return;
    }

    // ② Await in-flight pre-fetch
    if (prefetchPromiseRef.current) {
      await prefetchPromiseRef.current;
      if (nextSegmentRef.current && isLiveRef.current) {
        const { text, url } = nextSegmentRef.current;
        nextSegmentRef.current = null;
        playLiveSegment(text, url);
        return;
      }
    }

    // ③ Fetch fresh
    if (!isLiveRef.current) return;
    try {
      const mode = selectedModeRef.current;
      const ctx  = buildContextRef.current();
      const text = await fetchCommentaryText(mode, ctx);
      const url  = await fetchTTSUrl(text, mode);
      if (!isLiveRef.current) { if (url) URL.revokeObjectURL(url); return; }
      playLiveSegment(text, url);
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
    nextSegmentRef.current     = null;
    prefetchingRef.current     = false;
    prefetchPromiseRef.current = null;
    stopAudio();
    setCommentary("");
    setGenError("");
    try {
      const mode = selectedModeRef.current;
      const ctx  = buildContextRef.current();
      const text = await fetchCommentaryText(mode, ctx);
      const url  = await fetchTTSUrl(text, mode);
      if (!isLiveRef.current) { if (url) URL.revokeObjectURL(url); return; }
      playLiveSegment(text, url);
    } catch (e) {
      setLiveError(e.message);
      isLiveRef.current = false;
      setIsLive(false);
      setLiveStatus("");
    }
  };

  const stopLiveCommentary = () => {
    isLiveRef.current = false;
    setIsLive(false);
    setLiveStatus("");
    prefetchingRef.current = false;
    if (nextSegmentRef.current?.url) URL.revokeObjectURL(nextSegmentRef.current.url);
    nextSegmentRef.current     = null;
    prefetchPromiseRef.current = null;
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
                      disabled={isLoadingAudio}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
                      aria-label={isPlaying ? "Stop voice" : "Play voice"}
                    >
                      {isLoadingAudio ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPlaying ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      {isLoadingAudio ? "Loading…" : isPlaying ? "Stop" : "Hear it"}
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
