"use client";

import { useWebRTCStore } from "@/context/webrtc/WebRTCContext";
import { useEffect, useState, useRef } from "react";

export default function FileMetaLocal() {
  const { webrtc } = useWebRTCStore();
  const [progress, setProgress] = useState(0);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState("Idle");

  const writerRef = useRef(null);
  const receivedSizeRef = useRef(0);
  const totalSizeRef = useRef(0);

  useEffect(() => {
    let dc = null;

    const initStreamSaver = async () => {
      try {
        const streamSaver = (await import('streamsaver')).default;
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

            const streamSaver = await initStreamSaver();
            if (streamSaver) {
              const fileStream = streamSaver.createWriteStream(msg.fileName, {
                size: msg.fileSize
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
          let chunk;
          if (data instanceof ArrayBuffer) {
            chunk = new Uint8Array(data);
          } else if (data instanceof Blob) {
            chunk = new Uint8Array(await data.arrayBuffer());
          } else {
            return;
          }

          await writerRef.current.write(chunk);

          receivedSizeRef.current += chunk.byteLength;
          const pct = Math.round((receivedSizeRef.current / totalSizeRef.current) * 100);

          if (pct > progress) {
            setProgress(pct);
          }
        } catch (error) {
          console.error("Write Error:", error);
          setStatus("Error Writing File");
        }
      }
    };

    // Use WebRTCManager to get notified about DataChannel
    // First check if already exists
    if (webrtc.dataChannel) {
      dc = webrtc.dataChannel;
      dc.onmessage = handleMessage;
      console.log("Receiver: Reconnected to existing DataChannel");
    }

    // Subscribe to new channels
    webrtc.on("onDataChannel", (channel) => {
      dc = channel;
      dc.binaryType = "arraybuffer";
      dc.onmessage = handleMessage;
      console.log("Receiver: Connected & Listening via event");
    });

    return () => {
      // Cleanup listener if possible, but webrtc manager persists.
      // Maybe we should just let manager handle it?
      // For now, adhering to refactor style.
    };

  }, [webrtc, progress]);

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Receiver Status</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${status === "Completed" ? "bg-green-100 text-green-700" :
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