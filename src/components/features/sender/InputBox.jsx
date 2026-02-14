"use client";

import { useWebRTCStore } from "@/context/webrtc/WebRTCContext";
import { useState, useRef, useEffect } from "react";
import { Upload, File, FileText, Image as ImageIcon, Film, Music, Archive, Send, X, Check } from "lucide-react";
import { toast } from "sonner";

// File type icon mapping
const getFileIcon = (type) => {
  if (!type) return File;
  if (type.startsWith('image/')) return ImageIcon;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return Archive;
  return File;
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function FileMetaInput({ onSpeedUpdate }) {
  const [files, setFiles] = useState([]);
  const [progressMap, setProgressMap] = useState({}); // { fileName: progress }
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { webrtc } = useWebRTCStore();

  const abortController = useRef(null);
  const fileInputRef = useRef(null);

  // Helper for speed calculation
  const speedRef = useRef({
    lastBytes: 0,
    lastTime: Date.now(),
    bytesSinceLastUpdate: 0
  });

  // Helper to add files and send selection msg
  const addFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(f => !files.some(existing => existing.name === f.name && existing.size === f.size));

    if (validFiles.length === 0) return;

    setFiles(prev => [...prev, ...validFiles]);
    setIsSending(false);

    // Send selection message for new files
    if (webrtc?.dataChannel?.readyState === "open") {
      validFiles.forEach(f => {
        const msg = {
          type: "file-selected",
          fileName: f.name,
          fileType: f.type,
          fileSize: f.size,
        };
        webrtc.dataChannel.send(JSON.stringify(msg));
        console.log("📤 [SENDER] Sent file-selected:", msg);
      });
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    setProgressMap(prev => {
      const newMap = { ...prev };
      delete newMap[fileName];
      return newMap;
    });
  };

  // Monitor Data Channel state and send selection when connected
  useEffect(() => {
    if (files.length > 0 && webrtc?.dataChannel) {
      const dc = webrtc.dataChannel;
      if (dc.readyState === "open") {
        // Resend all current files
        files.forEach(f => {
          const msg = {
            type: "file-selected",
            fileName: f.name,
            fileType: f.type,
            fileSize: f.size,
          };
          dc.send(JSON.stringify(msg));
        });
      } else {
        const onOpen = () => {
          files.forEach(f => {
            const msg = {
              type: "file-selected",
              fileName: f.name,
              fileType: f.type,
              fileSize: f.size,
            };
            dc.send(JSON.stringify(msg));
          });
          dc.removeEventListener("open", onOpen);
        };
        dc.addEventListener("open", onOpen);
        return () => dc.removeEventListener("open", onOpen);
      }
    }
  }, [files, webrtc?.dataChannel]);

  const handleSend = async () => {
    const dc = webrtc?.dataChannel;

    if (!dc || dc.readyState !== "open") {
      toast.error("Connection is not open. Please connect peers first.");
      return;
    }
    if (files.length === 0 || isSending) return;

    setIsSending(true);
    abortController.current = new AbortController();
    speedRef.current = { lastBytes: 0, lastTime: Date.now(), bytesSinceLastUpdate: 0 };

    try {
      // Set bufferedAmountLowThreshold for backpressure
      dc.bufferedAmountLowThreshold = 65535; // 64KB

      for (const file of files) {
        if (abortController.current.signal.aborted) throw new Error("Cancelled");

        // 1. Send Metadata
        const metadata = {
          type: "meta",
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        };
        dc.send(JSON.stringify(metadata));
        console.log(`📤 [SENDER] Metadata sent for ${file.name}`);

        // Wait a bit for receiver to initialize write stream
        await new Promise(r => setTimeout(r, 100));

        // 2. Configuration
        const CHUNK_SIZE = 16 * 1024; // 16KB is safe
        const MAX_BUFFERED_AMOUNT = 64 * 1024; // 64KB backpressure limit
        let offset = 0;

        // 3. Main Loop
        while (offset < file.size) {
          if (abortController.current.signal.aborted) throw new Error("Cancelled");

          // Backpressure Control: Wait if buffer is full
          if (dc.bufferedAmount > MAX_BUFFERED_AMOUNT) {
            await new Promise((resolve) => {
              const onLowBuffer = () => {
                dc.removeEventListener("bufferedamountlow", onLowBuffer);
                resolve();
              };
              dc.addEventListener("bufferedamountlow", onLowBuffer);

              // Double check in case it drained while setting up
              if (dc.bufferedAmount <= MAX_BUFFERED_AMOUNT) {
                dc.removeEventListener("bufferedamountlow", onLowBuffer);
                resolve();
              }
            });
          }

          const chunkBlob = file.slice(offset, offset + CHUNK_SIZE);
          const chunkBuffer = await chunkBlob.arrayBuffer();

          try {
            dc.send(chunkBuffer);

            // Speed Calculation
            speedRef.current.bytesSinceLastUpdate += chunkBuffer.byteLength;
            const now = Date.now();
            const timeDiff = now - speedRef.current.lastTime;

            if (timeDiff >= 500) { // Update every 500ms
              const speed = (speedRef.current.bytesSinceLastUpdate / timeDiff) * 1000; // Bytes per second
              if (onSpeedUpdate) onSpeedUpdate(speed);

              speedRef.current.lastTime = now;
              speedRef.current.bytesSinceLastUpdate = 0;
            }

          } catch (error) {
            console.warn("Queue full or error, pausing...", error);
            // If send buffer is full, wait a bit
            await new Promise(r => setTimeout(r, 50));
            continue;
          }

          offset += chunkBuffer.byteLength;

          // Update progress less frequently to save render cycles
          if (offset % (1024 * 1024) === 0 || offset >= file.size) {
            const pct = Math.round((offset / file.size) * 100);
            setProgressMap(prev => ({ ...prev, [file.name]: pct }));

            // Yield to event loop to keep UI responsive
            await new Promise(r => setTimeout(r, 0));
          }
        }

        // 4. Finish current file
        dc.send(JSON.stringify({ type: "end" }));
        console.log(`✅ [SENDER] File ${file.name} sent completely!`);
        setProgressMap(prev => ({ ...prev, [file.name]: 100 }));

        // Wait a bit before next file to ensure receiver catches up on 'end' event
        await new Promise(r => setTimeout(r, 500));
      }

      toast.success("All files sent successfully!");

    } catch (err) {
      console.error("❌ [SENDER] Transfer Error:", err);
      toast.error("Transfer failed: " + err.message);
    } finally {
      setIsSending(false);
      if (onSpeedUpdate) onSpeedUpdate(0); // Reset speed
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Share Files Securely
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select or drag & drop multiple files to send via peer-to-peer connection
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300 group
          ${isDragging
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
            : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Click to browse or drag & drop
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Support multiple files
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, idx) => {
            const FileIcon = getFileIcon(file.type);
            const progress = progressMap[file.name] || 0;

            return (
              <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>

                    {/* Progress bar per file */}
                    {progress > 0 && (
                      <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {progress === 100 && <Check className="w-5 h-5 text-green-500" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.name);
                    }}
                    disabled={isSending}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Send Controls */}
      {files.length > 0 && (
        <button
          onClick={handleSend}
          disabled={isSending}
          className={`
              w-full py-3.5 rounded-xl font-semibold text-white transition-all
              flex items-center justify-center gap-2 shadow-lg
              ${isSending
              ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] hover:shadow-xl"
            }
            `}
        >
          {isSending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending Files...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send {files.length} Files</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}