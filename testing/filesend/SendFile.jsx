"use client";

import { useWebRTCStore } from "@/context/WebRTCContext";
import { useState, useRef, useEffect } from "react";

export default function FileMetaInput() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const { dataChannelRef } = useWebRTCStore();
  
  // Ref to handle cancellation if needed (optional)
  const abortController = useRef(null);

  const handleChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setProgress(0);
    setIsSending(false);
  };

  const handleSend = async () => {
    const dc = dataChannelRef.current;

    if (!dc || dc.readyState !== "open") {
      alert("Connection is not open. Please connect peers first.");
      return;
    }
    if (!file || isSending) return;

    setIsSending(true);
    setProgress(0);
    abortController.current = new AbortController();

    try {
      // 1. Send Metadata
      const metadata = {
        type: "meta",
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
      dc.send(JSON.stringify(metadata));
      console.log("Metadata sent:", metadata);

      // 2. Configuration
      const CHUNK_SIZE = 16 * 1024; // 16KB (Safe for WebRTC)
      // Jab buffer isse zyada ho, tab ruk jao (64KB)
      const MAX_BUFFER_THRESHOLD = 64 * 1024; 
      
      let offset = 0;

      // 3. Main Loop (Direct Disk Read)
      while (offset < file.size) {
        // Cancel check
        if (abortController.current.signal.aborted) throw new Error("Cancelled");

        // --- STRICT BACKPRESSURE CONTROL ---
        if (dc.bufferedAmount > MAX_BUFFER_THRESHOLD) {
          await new Promise((resolve) => {
            const onLowBuffer = () => {
              dc.removeEventListener("bufferedamountlow", onLowBuffer);
              resolve();
            };
            dc.addEventListener("bufferedamountlow", onLowBuffer);

            // Safety Fallback: Agar event miss ho jaye (Network quirk)
            if (dc.bufferedAmount <= MAX_BUFFER_THRESHOLD) {
               dc.removeEventListener("bufferedamountlow", onLowBuffer);
               resolve();
            }
          });
        }

        // --- READ & SEND ---
        const chunkBlob = file.slice(offset, offset + CHUNK_SIZE);
        const chunkBuffer = await chunkBlob.arrayBuffer();

        try {
          dc.send(chunkBuffer);
        } catch (error) {
          // "Queue Full" error handling - retry logic
          console.warn("Queue full, retrying in 50ms...");
          await new Promise(r => setTimeout(r, 50));
          continue; // Wapas same offset pe try karo
        }

        offset += chunkBuffer.byteLength;

        // UI Update (Throttled)
        if (offset % (2 * 1024 * 1024) === 0 || offset >= file.size) {
           const pct = Math.round((offset / file.size) * 100);
           setProgress(pct);
           // Allow UI to render
           await new Promise(r => setTimeout(r, 0)); 
        }
      }

      // 4. Finish
      dc.send(JSON.stringify({ type: "end" }));
      console.log("File sent completely!");
      setProgress(100);

    } catch (err) {
      console.error("Transfer Error:", err);
      alert("Transfer failed: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition">
        <input
          type="file"
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <span className="text-gray-600 font-medium">
            {file ? file.name : "Click to select a large file (6GB+)"}
          </span>
          {file && (
            <p className="text-xs text-gray-400 mt-1">
              {(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB
            </p>
          )}
        </label>
      </div>

      {file && (
        <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`w-full py-2.5 rounded-lg font-medium text-white transition-all active:scale-[0.98] ${
              isSending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
          >
            {isSending ? "Sending..." : "Send File"}
          </button>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}