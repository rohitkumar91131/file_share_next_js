"use client";

import { useState, useRef } from "react";
import { Mic, X, Sparkles, Play, Loader2, Volume2, VolumeX } from "lucide-react";
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
  professional: { speaker: "meera",  pace: 0.9 },
  casual:       { speaker: "arvind", pace: 1.1 },
  roast:        { speaker: "arvind", pace: 1.15 },
  sarcasm:      { speaker: "meera",  pace: 0.95 },
  cricket:      { speaker: "arvind", pace: 1.3  },
  epic:         { speaker: "meera",  pace: 0.8  },
  news:         { speaker: "meera",  pace: 1.0  },
};

export default function AiCommentary({ uploadSpeed = 0 }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [selectedMode, setSelectedMode] = useState("casual");
  const [commentary, setCommentary]   = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [audioError, setAudioError]   = useState("");
  const [genError, setGenError]       = useState("");

  const audioRef = useRef(null);

  const { connectionState, connectionType } = useWebRTCStore();
  const { files: receivedFiles, downloadSpeed } = useReceiveFileData();
  const { selectedFiles } = useSendFileData();

  // ---- helpers ----

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
    // Pass client-side time so server templates can format in user's locale
    clientTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  });

  // ---- generate commentary text ----

  const generateCommentary = async () => {
    setIsGenerating(true);
    setGenError("");
    setCommentary("");
    stopAudio();

    try {
      const res = await fetch("/api/ai-commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: selectedMode, ...buildContext() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate commentary");
      setCommentary(data.text);
    } catch (e) {
      setGenError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Sarvam AI TTS ----

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const playCommentary = async () => {
    if (!commentary) return;
    if (isPlaying) { stopAudio(); return; }

    setIsLoadingAudio(true);
    setAudioError("");

    try {
      const settings = SPEAKER_SETTINGS[selectedMode] || { speaker: "meera", pace: 1.0 };
      const res = await fetch("/api/ai-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentary, ...settings }),
      });
      const data = await res.json();

      if (!res.ok) {
        // 503 = API key not configured → show friendly message
        setAudioError(res.status === 503 ? "🔑 Add SARVAM_API_KEY to your .env.local to enable voice" : data.error || "TTS failed");
        return;
      }

      // data.audio is base64-encoded WAV
      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

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
            </div>
            <button
              onClick={() => { setIsOpen(false); stopAudio(); }}
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
                    onClick={() => { setSelectedMode(mode.id); setCommentary(""); setGenError(""); stopAudio(); }}
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

            {/* Generate Button */}
            <button
              onClick={generateCommentary}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate {activeMode?.emoji} Commentary</>
              )}
            </button>

            {/* Error */}
            {genError && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center">{genError}</p>
            )}

            {/* Commentary Output */}
            {commentary && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-3">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{commentary}</p>

                <div className="flex items-center gap-2">
                  {/* Play / Stop */}
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

                  {/* Re-generate */}
                  <button
                    onClick={generateCommentary}
                    disabled={isGenerating}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" /> Again
                  </button>
                </div>

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
        onClick={() => { setIsOpen((o) => !o); if (isOpen) stopAudio(); }}
        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Toggle AI Commentary"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    </div>
  );
}
