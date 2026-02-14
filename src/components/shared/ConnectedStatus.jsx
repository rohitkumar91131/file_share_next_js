import React, { useRef, useEffect } from 'react';
import { CheckCircle2, Wifi, Network, Globe } from 'lucide-react';
import { useWebRTCStore } from '@/context/webrtc/WebRTCContext';
import gsap from 'gsap';

export default function ConnectedStatus() {
    const containerRef = useRef(null);
    const { connectionType } = useWebRTCStore();

    useEffect(() => {
        // Entrance animation
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: -20, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }, []);

    const getIconAndText = () => {
        switch (connectionType) {
            case 'lan':
                return { icon: Network, text: 'LAN / Direct' };
            case 'wifi':
                return { icon: Wifi, text: 'Same Wi-Fi' };
            case 'wan':
                return { icon: Globe, text: 'Remote Connection' };
            default:
                return { icon: Wifi, text: 'Connected' };
        }
    };

    const { icon: Icon, text } = getIconAndText();

    return (
        <div
            ref={containerRef}
            className="fixed top-24 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full shadow-lg backdrop-blur-md"
        >
            <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{text}</span>
            <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
        </div>
    );
}
