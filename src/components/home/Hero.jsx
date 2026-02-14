"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Hero() {
    const containerRef = useRef(null);
    const badgeRef = useRef(null);
    const titleRef = useRef(null);
    const textRef = useRef(null);
    const ctaRef = useRef(null);
    const trustRef = useRef(null);
    const blobRef1 = useRef(null);
    const blobRef2 = useRef(null);
    const blobRef3 = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Initial entrance animations
        tl.fromTo(badgeRef.current,
            { y: -20, opacity: 0, scale: 0.8 },
            { y: 0, opacity: 1, scale: 1, duration: 0.8 }
        )
            .fromTo(titleRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                "-=0.4"
            )
            .fromTo(textRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                "-=0.6"
            )
            .fromTo(ctaRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
                "-=0.6"
            )
            .fromTo(trustRef.current.children,
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
                "-=0.4"
            );

        // Continuous floating animation for blobs
        gsap.to(blobRef1.current, {
            x: "random(-30, 30)",
            y: "random(-30, 30)",
            duration: "random(5, 8)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to(blobRef2.current, {
            x: "random(-40, 40)",
            y: "random(-40, 40)",
            duration: "random(6, 10)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1
        });

        gsap.to(blobRef3.current, {
            x: "random(-20, 20)",
            y: "random(-20, 20)",
            duration: "random(4, 7)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 2
        });

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-500 relative">
            <div className="max-w-7xl mx-auto text-center relative z-10">

                {/* Badge */}
                <div ref={badgeRef} className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-8 opacity-0">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    v2.0 is live
                </div>

                {/* Headline */}
                <h1 ref={titleRef} className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.1] opacity-0">
                    Share Files. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        No Sign Up Required.
                    </span>
                </h1>

                {/* Subtext */}
                <p ref={textRef} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed opacity-0">
                    Secure, peer-to-peer file sharing directly in your browser.
                    No accounts, no limits, no friction. Just generate a link and share.
                </p>

                {/* CTAs */}
                <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0">
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
                <div ref={trustRef} className="mt-16 flex flex-wrap justify-center gap-8 text-slate-400 dark:text-slate-500 text-sm font-medium">
                    <div className="flex items-center gap-2 opacity-0">
                        <Shield className="w-4 h-4" /> End-to-End Encrypted
                    </div>
                    <div className="flex items-center gap-2 opacity-0">
                        <Zap className="w-4 h-4" /> Blazing Fast P2P
                    </div>
                    <div className="flex items-center gap-2 opacity-0">
                        <Globe className="w-4 h-4" /> No Server Storage
                    </div>
                </div>

            </div>

            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                <div ref={blobRef1} className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30"></div>
                <div ref={blobRef2} className="absolute top-20 right-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30"></div>
                <div ref={blobRef3} className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30"></div>
            </div>
        </section>
    );
}
