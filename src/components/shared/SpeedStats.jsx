"use client";
import React, { useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';
import gsap from 'gsap';

export default function SpeedStats({ speed, type = 'upload' }) {
    const containerRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        if (speed > 0) {
            gsap.to(containerRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            gsap.to(containerRef.current, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: "power2.in"
            });
        }
    }, [speed]);

    const formattedSpeed = React.useMemo(() => {
        if (speed < 1024) return `${speed.toFixed(1)} B/s`;
        if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB/s`;
        return `${(speed / (1024 * 1024)).toFixed(1)} MB/s`;
    }, [speed]);

    return (
        <div
            ref={containerRef}
            className="fixed top-36 right-4 z-40 flex items-center gap-3 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg opacity-0 translate-y-[-10px]"
        >
            <div className={`p-2 rounded-full ${type === 'upload' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
                {type === 'upload' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {type === 'upload' ? 'Upload Speed' : 'Download Speed'}
                </p>
                <p ref={textRef} className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-200">
                    {formattedSpeed}
                </p>
            </div>
        </div>
    );
}
