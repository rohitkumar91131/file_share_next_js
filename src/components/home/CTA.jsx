"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
    const containerRef = useRef(null);

    useGSAP(() => {
        gsap.fromTo(containerRef.current.children,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                }
            }
        );
    }, { scope: containerRef });

    return (
        <section className="py-24 bg-slate-900 dark:bg-black text-white overflow-hidden relative border-t border-slate-800/50">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 L100 100 L0 100 Z" fill="white" />
                </svg>
            </div>

            <div ref={containerRef} className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white opacity-0">
                    Ready to start sharing?
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto opacity-0">
                    No credit card. No sign up. No hidden fees. Just open source peer-to-peer sharing.
                </p>
                <div className="opacity-0">
                    <Link
                        href="/share"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1"
                    >
                        Launch FileShare Now
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
