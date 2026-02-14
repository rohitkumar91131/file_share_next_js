"use client";
import { useEffect, useRef } from 'react';
import { useWebRTCStore } from '@/context/webrtc/WebRTCContext';
import { useReceiveFileData } from '@/context/ReceiveFileDataContext';
import { formatFileSize } from '@/utils/fileUtils';

export function useFileReceiver() {
    const { webrtc } = useWebRTCStore();
    const { addFile, updateProgress } = useReceiveFileData();

    const receivingFileRef = useRef(null);
    const chunksRef = useRef([]);
    const receivedBytesRef = useRef(0);
    const fileIndexRef = useRef(-1);

    useEffect(() => {
        if (!webrtc?.dataChannel) return;

        const dc = webrtc.dataChannel;

        const handleMessage = async (event) => {
            const data = event.data;

            if (typeof data === 'string') {
                try {
                    const msg = JSON.parse(data);

                    if (msg.type === 'meta') {
                        // Start receiving new file
                        receivingFileRef.current = {
                            fileName: msg.fileName,
                            fileType: msg.fileType,
                            fileSize: msg.fileSize,
                        };
                        chunksRef.current = [];
                        receivedBytesRef.current = 0;

                        // Add to UI
                        addFile({
                            name: msg.fileName,
                            type: msg.fileType,
                            size: formatFileSize(msg.fileSize),
                            progress: 0,
                        });

                        fileIndexRef.current++;

                    } else if (msg.type === 'end') {
                        // File complete
                        if (!receivingFileRef.current || chunksRef.current.length === 0) {
                            return;
                        }

                        // Assemble and download
                        const blob = new Blob(chunksRef.current, {
                            type: receivingFileRef.current.fileType || 'application/octet-stream',
                        });

                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = receivingFileRef.current.fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        updateProgress(fileIndexRef.current, 100);

                        // Reset
                        receivingFileRef.current = null;
                        chunksRef.current = [];
                        receivedBytesRef.current = 0;
                    }
                } catch (e) {
                    console.error('Message parse error:', e);
                }
            } else if (data instanceof ArrayBuffer) {
                // Binary chunk
                if (!receivingFileRef.current) return;

                chunksRef.current.push(data);
                receivedBytesRef.current += data.byteLength;

                const progress = Math.round(
                    (receivedBytesRef.current / receivingFileRef.current.fileSize) * 100
                );

                updateProgress(fileIndexRef.current, progress);
            }
        };

        dc.addEventListener('message', handleMessage);

        return () => {
            dc.removeEventListener('message', handleMessage);
        };
    }, [webrtc, webrtc?.dataChannel, addFile, updateProgress]);
}
