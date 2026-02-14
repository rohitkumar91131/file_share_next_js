"use client";
import { useState, useRef } from 'react';
import { useWebRTCStore } from '@/context/webrtc/WebRTCContext';
import { formatFileSize } from '@/utils/fileUtils';

export function useFileTransfer() {
    const { webrtc, connectionState } = useWebRTCStore();
    const [progress, setProgress] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const abortController = useRef(null);

    const sendFile = async (file) => {
        const dc = webrtc?.dataChannel;

        if (!dc || dc.readyState !== 'open') {
            throw new Error('Connection not ready');
        }

        setIsSending(true);
        setProgress(0);
        abortController.current = new AbortController();

        try {
            // Send metadata
            const metadata = {
                type: 'meta',
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            };
            dc.send(JSON.stringify(metadata));

            // Chunk configuration
            const CHUNK_SIZE = 16 * 1024; // 16KB
            const MAX_BUFFER = 64 * 1024; // 64KB

            let offset = 0;

            // Send file chunks
            while (offset < file.size) {
                if (abortController.current.signal.aborted) {
                    throw new Error('Transfer cancelled');
                }

                // Backpressure control
                if (dc.bufferedAmount > MAX_BUFFER) {
                    await new Promise((resolve) => {
                        const onLowBuffer = () => {
                            dc.removeEventListener('bufferedamountlow', onLowBuffer);
                            resolve();
                        };
                        dc.addEventListener('bufferedamountlow', onLowBuffer);
                    });
                }

                // Read and send chunk
                const chunkBlob = file.slice(offset, offset + CHUNK_SIZE);
                const chunkBuffer = await chunkBlob.arrayBuffer();
                dc.send(chunkBuffer);

                offset += chunkBuffer.byteLength;

                // Update progress
                const pct = Math.round((offset / file.size) * 100);
                setProgress(pct);
                await new Promise(r => setTimeout(r, 0)); // Allow UI update
            }

            // Send end signal
            dc.send(JSON.stringify({ type: 'end' }));
            setProgress(100);

            return { success: true };
        } catch (error) {
            console.error('Transfer error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsSending(false);
        }
    };

    const cancelTransfer = () => {
        abortController.current?.abort();
    };

    return {
        sendFile,
        cancelTransfer,
        progress,
        isSending,
        isConnected: connectionState === 'connected',
    };
}
