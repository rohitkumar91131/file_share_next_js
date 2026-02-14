"use client";
import React from "react";
import { Copy, Wifi, Share } from "lucide-react";

const steps = [
    {
        step: "01",
        title: "Start Session",
        desc: "Click 'Start Sharing' to generate a unique session link.",
        icon: <Wifi className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    },
    {
        step: "02",
        title: "Share Link",
        desc: "Send the link or scan the QR code with any device.",
        icon: <Copy className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    },
    {
        step: "03",
        title: "Transfer Files",
        desc: "Drag & drop files to send them instantly.",
        icon: <Share className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-black transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Simple, intuitive, and designed for speed.
                    </p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>

                    {steps.map((s, i) => (
                        <div key={i} className="relative flex flex-col items-center text-center group">
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-lg rounded-full flex items-center justify-center mb-6 z-10 transition-transform group-hover:scale-110">
                                {s.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 max-w-xs">{s.desc}</p>

                            <div className="absolute -top-6 -right-6 text-6xl font-black text-slate-100 dark:text-slate-800/50 -z-10 select-none transition-colors">
                                {s.step}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
