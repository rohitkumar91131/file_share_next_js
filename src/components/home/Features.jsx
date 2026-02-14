"use client";
import React from "react";
import { Shield, Zap, Lock, Smartphone, WifiOff, Globe } from "lucide-react";

const features = [
    {
        icon: <Zap className="w-6 h-6 text-yellow-500" />,
        title: "Instant Transfer",
        desc: "Direct peer-to-peer connection means no server bottlenecks.",
    },
    {
        icon: <Shield className="w-6 h-6 text-green-500" />,
        title: "Secure & Private",
        desc: "End-to-end encryption. Only you and the receiver see the files.",
    },
    {
        icon: <WifiOff className="w-6 h-6 text-blue-500" />,
        title: "Local Network Mode",
        desc: "Share seamlessly even without internet on the same Wi-Fi.",
    },
    {
        icon: <Smartphone className="w-6 h-6 text-purple-500" />,
        title: "Cross Platform",
        desc: "Works on any device with a browser. Android, iOS, Windows, Mac.",
    },
    {
        icon: <Lock className="w-6 h-6 text-red-500" />,
        title: "No Sign Up",
        desc: "We don't collect your data. No accounts, no tracking.",
    },
    {
        icon: <Globe className="w-6 h-6 text-indigo-500" />,
        title: "Global Reach",
        desc: "Connect with anyone, anywhere in the world instantly.",
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-white dark:bg-slate-950 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Why FileShare?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Packed with everything you need for fast, secure file sharing. Nothing else.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="p-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
