"use client";

import { useWebRTCStore } from "@/context/WebRTCContext";
import { useEffect, useState, useRef } from "react";

export default function FileMetaLocal() {
  const { dataChannelRef } = useWebRTCStore();
  const [progress, setProgress] = useState(0);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState("Idle");

  // Refs for stream handling
  const writerRef = useRef(null);
  const receivedSizeRef = useRef(0);
  const totalSizeRef = useRef(0);

  useEffect(() => {
    let dc = null;
    
    // Dynamically load StreamSaver (Client-side only)
    const initStreamSaver = async () => {
      try {
        const streamSaver = (await import('streamsaver')).default;
        // Important: Use GitHub MITM for HTTPS support if not on localhost
        if (!window.isSecureContext) {
           console.warn("StreamSaver requires HTTPS or Localhost");
        }
        streamSaver.mitm = 'https://jimmywarting.github.io/StreamSaver.js/mitm.html?version=2.0.0';
        return streamSaver;
      } catch (e) {
        console.error("StreamSaver load failed", e);
        return null;
      }
    };

    const handleMessage = async (event) => {
      const data = event.data;

      // --- 1. HANDLE JSON METADATA ---
      if (typeof data === "string") {
        try {
          const msg = JSON.parse(data);

          if (msg.type === "meta") {
            console.log("Starting Download:", msg.fileName);
            
            setMeta(msg);
            totalSizeRef.current = msg.fileSize;
            receivedSizeRef.current = 0;
            setProgress(0);
            setStatus("Receiving...");

            // Initialize StreamSaver
            const streamSaver = await initStreamSaver();
            if (streamSaver) {
              const fileStream = streamSaver.createWriteStream(msg.fileName, {
                size: msg.fileSize // Helps browser show correct ETA
              });
              writerRef.current = fileStream.getWriter();
            }
          } 
          else if (msg.type === "end") {
            console.log("Download Complete");
            if (writerRef.current) {
              await writerRef.current.close();
              writerRef.current = null;
            }
            setStatus("Completed");
            setProgress(100);
          }
        } catch (e) {
          console.error("JSON Error:", e);
        }
        return;
      }

      // --- 2. HANDLE BINARY DATA ---
      if (writerRef.current) {
        try {
          // Convert to Uint8Array safely
          let chunk;
          if (data instanceof ArrayBuffer) {
            chunk = new Uint8Array(data);
          } else if (data instanceof Blob) {
            chunk = new Uint8Array(await data.arrayBuffer());
          } else {
            return;
          }

          // Write directly to Disk
          await writerRef.current.write(chunk);

          // Update Progress
          receivedSizeRef.current += chunk.byteLength;
          const pct = Math.round((receivedSizeRef.current / totalSizeRef.current) * 100);
          
          // State update thoda kam baar karein (Performance)
          if (pct > progress) {
             setProgress(pct);
          }
        } catch (error) {
          console.error("Write Error:", error);
          setStatus("Error Writing File");
        }
      }
    };

    // Attach Listener Logic
    const waitForChannel = () => {
      const chan = dataChannelRef.current;
      if (!chan || chan.readyState !== "open") {
        setTimeout(waitForChannel, 500);
        return;
      }
      dc = chan;
      // Binary type set karna zaroori hai
      dc.binaryType = "arraybuffer"; 
      console.log("Receiver: Connected & Listening");
      dc.addEventListener("message", handleMessage);
    };

    waitForChannel();

    return () => {
      if (dc) dc.removeEventListener("message", handleMessage);
      if (writerRef.current) writerRef.current.abort();
    };
  }, [dataChannelRef]); // Removed 'progress' from dependency to avoid re-binding listener

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Receiver Status</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            status === "Completed" ? "bg-green-100 text-green-700" :
            status === "Receiving..." ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {status}
          </span>
        </div>

        {meta && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-800 truncate">{meta.fileName}</p>
            <p className="text-xs mt-1">
              {(receivedSizeRef.current / (1024 * 1024)).toFixed(2)} MB / 
              {(meta.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Download Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}