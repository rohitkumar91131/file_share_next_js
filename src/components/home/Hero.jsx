"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";

export default function Hero() {
    return (
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
            <div className="max-w-7xl mx-auto text-center relative z-10">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    v2.0 is live
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
                    Share Files. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        No Sign Up Required.
                    </span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Secure, peer-to-peer file sharing directly in your browser.
                    No accounts, no limits, no friction. Just generate a link and share.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/share"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1"
                    >
                        Start Sharing Instantly
                        <ArrowRight className="w-5 h-5" />
                    </Link>

                    <a
                        href="#how-it-works"
                        className="px-8 py-4 rounded-full font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                    >
                        How it works
                    </a>
                </div>

                {/* Trust Signals */}
                <div className="mt-16 flex flex-wrap justify-center gap-8 text-slate-400 dark:text-slate-500 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" /> End-to-End Encrypted
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Blazing Fast P2P
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" /> No Server Storage
                    </div>
                </div>

            </div>

            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
        </section>
    );
}
