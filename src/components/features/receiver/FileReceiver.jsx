"use client";

import { useRef, useEffect } from "react";
import { useWebRTCStore } from "@/context/webrtc/WebRTCContext";
import { useReceiveFileData } from "@/context/ReceiveFileDataContext";
import { toast } from "sonner";

// Helper function
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default function FileReceiver() {
    const { webrtc } = useWebRTCStore();
    const { addFile, updateProgress, updateFile, files, setDownloadSpeed } = useReceiveFileData();

    // Use a ref to access the latest files state inside the event listener
    // without triggering a re-render/re-subscription of the effect.
    const filesRef = useRef(files);

    // Keep the ref in sync with the state
    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    const receivingFileRef = useRef(null);
    const receivedBytesRef = useRef(0);
    const speedRef = useRef({
        lastBytes: 0,
        lastTime: Date.now(),
        bytesSinceLastUpdate: 0
    });

    useEffect(() => {
        console.log("🔧 [FileReceiver] Component mounted/updated");

        // Dynamically import streamSaver to ensure client-side execution
        let streamSaver;
        import('streamsaver').then(module => {
            streamSaver = module.default;
            // streamSaver.mitm = 'https://your-mitm.github.io/mitm.html'; // Optional MitM
        });

        if (!webrtc?.dataChannel) {
            console.warn("⚠️ [FileReceiver] No data channel available yet");
            return;
        }

        const dc = webrtc.dataChannel;
        console.log("✅ [FileReceiver] Attaching message listener");

        // Message Queue to ensure sequential processing
        let messageQueue = Promise.resolve();

        const processMessage = async (event) => {
            const data = event.data;

            // Check if it's metadata (JSON string)
            if (typeof data === "string") {
                try {
                    const msg = JSON.parse(data);

                    if (msg.type === "file-selected") {
                        console.log("📦 [FileReceiver] File selected by sender:", msg);

                        // Toast notification for file selection
                        toast(`FILE INCOMING`, {
                            description: `${msg.fileName} - ${formatFileSize(msg.fileSize)}`,
                            action: {
                                label: 'View',
                                onClick: () => {
                                    const element = document.getElementById(`file-${msg.fileName}`);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        // Optional: Add highlight effect
                                        element.classList.add('ring-2', 'ring-blue-500');
                                        setTimeout(() => element.classList.remove('ring-2', 'ring-blue-500'), 2000);
                                    } else {
                                        console.warn("Element not found:", `file-${msg.fileName}`);
                                    }
                                },
                            },
                        });

                        // Check if file already exists (optional, to avoid dupes)
                        const exists = filesRef.current.some(f => f.name === msg.fileName && f.size === formatFileSize(msg.fileSize));
                        if (!exists) {
                            addFile({
                                name: msg.fileName,
                                type: msg.fileType,
                                size: formatFileSize(msg.fileSize),
                                rawSize: msg.fileSize, // Store raw size for matching
                                progress: 0,
                                status: 'pending' // pending | receiving | completed
                            });
                        }
                    } else if (msg.type === "meta") {
                        console.log("📦 [FileReceiver] Metadata received:", msg);

                        if (!streamSaver) {
                            console.error("❌ streamSaver not loaded yet");
                            return;
                        }

                        // Check if we have a pending file used for this
                        // We match by name and rawSize if possible, or just append if not found
                        let fileIndex = filesRef.current.findIndex(f =>
                            f.name === msg.fileName &&
                            (f.rawSize === msg.fileSize || f.size === formatFileSize(msg.fileSize)) &&
                            f.status === 'pending'
                        );

                        if (fileIndex === -1) {
                            // Valid case: Receiver just joined or missed the selected msg
                            fileIndex = filesRef.current.length;
                            addFile({
                                name: msg.fileName,
                                type: msg.fileType,
                                size: formatFileSize(msg.fileSize),
                                rawSize: msg.fileSize,
                                progress: 0,
                                status: 'receiving'
                            });
                        } else {
                            // Update existing pending file to receiving
                            updateFile(fileIndex, { status: 'receiving' });
                        }

                        // Create a write stream
                        const fileStream = streamSaver.createWriteStream(msg.fileName, {
                            size: msg.fileSize
                        });
                        const writer = fileStream.getWriter();

                        // Initialize new file receiving state
                        receivingFileRef.current = {
                            fileName: msg.fileName,
                            fileType: msg.fileType,
                            fileSize: msg.fileSize,
                            index: fileIndex, // Store the index for progress updates
                            writer: writer,
                        };
                        receivedBytesRef.current = 0;
                        speedRef.current = { lastBytes: 0, lastTime: Date.now(), bytesSinceLastUpdate: 0 };

                        console.log(`🚀 [FileReceiver] Ready to receive: ${msg.fileName} (Index: ${fileIndex})`);
                    } else if (msg.type === "end") {
                        console.log("✅ [FileReceiver] File transfer complete signal received");

                        const currentFile = receivingFileRef.current;

                        if (!currentFile) {
                            console.warn("⚠️ [FileReceiver] Received 'end' signal but no transfer in progress");
                            return;
                        }

                        // Validate file size
                        const currentReceived = receivedBytesRef.current;
                        const expectedSize = currentFile.fileSize;

                        if (currentReceived !== expectedSize) {
                            console.error(`❌ [FileReceiver] Size mismatch! Expected ${expectedSize}, got ${currentReceived}`);
                            toast.error(`Transfer incomplete: Received ${formatFileSize(currentReceived)} of ${formatFileSize(expectedSize)}`);

                            // Abort writer if possible
                            if (currentFile.writer) {
                                await currentFile.writer.abort("Size mismatch");
                            }
                        } else {
                            // Close the writer
                            if (currentFile.writer) {
                                await currentFile.writer.close();
                                console.log("✅ [FileReceiver] Writer closed successfully");
                            }

                            // Update progress to 100% and status to completed
                            if (currentFile.index !== undefined) {
                                updateProgress(currentFile.index, 100);
                                updateFile(currentFile.index, { status: 'completed' });
                                toast.success(`Received ${currentFile.fileName}`);
                            }
                        }

                        setDownloadSpeed(0);

                        // Reset
                        receivingFileRef.current = null;
                        receivedBytesRef.current = 0;
                    }
                } catch (e) {
                    console.error("❌ [FileReceiver] Error parsing/handling message:", e);
                }
            } else if (data instanceof ArrayBuffer) {
                // Binary chunk received
                if (!receivingFileRef.current || !receivingFileRef.current.writer) {
                    console.warn("⚠️ [FileReceiver] Received chunk but no writer active");
                    return;
                }

                try {
                    // Write chunk to stream
                    await receivingFileRef.current.writer.write(new Uint8Array(data));

                    receivedBytesRef.current += data.byteLength;

                    // Speed Calculation
                    speedRef.current.bytesSinceLastUpdate += data.byteLength;
                    const now = Date.now();
                    const timeDiff = now - speedRef.current.lastTime;

                    if (timeDiff >= 500) {
                        const speed = (speedRef.current.bytesSinceLastUpdate / timeDiff) * 1000;
                        if (setDownloadSpeed) setDownloadSpeed(speed);
                        speedRef.current.lastTime = now;
                        speedRef.current.bytesSinceLastUpdate = 0;
                    }

                    // Update progress
                    if (receivingFileRef.current.fileSize > 0) {
                        const progress = Math.round(
                            (receivedBytesRef.current / receivingFileRef.current.fileSize) * 100
                        );

                        if (receivingFileRef.current.index !== undefined) {
                            updateProgress(receivingFileRef.current.index, progress);
                        }
                    }

                } catch (err) {
                    console.error("❌ [FileReceiver] Error writing chunk:", err);
                    if (receivingFileRef.current.writer) {
                        receivingFileRef.current.writer.abort(err);
                    }
                    receivingFileRef.current = null;
                    toast.error("File write failed");
                }
            } else {
                console.warn("⚠️ [FileReceiver] Unknown message type:", typeof data);
            }
        };

        const handleMessage = (event) => {
            // Queue the message processing
            messageQueue = messageQueue.then(() => processMessage(event)).catch(err => {
                console.error("Error in message queue:", err);
            });
        };

        dc.addEventListener("message", handleMessage);

        return () => {
            console.log("🔧 [FileReceiver] Removing message listener");
            dc.removeEventListener("message", handleMessage);
        };
        // CRITICAL: Empty dependency array (or just channel) ensures listener is NOT removed/re-added
        // when files state changes.
    }, [webrtc?.dataChannel]); // Only re-run if data channel instance changes (e.g. reconnect)

    return null; // This is a headless component
}
