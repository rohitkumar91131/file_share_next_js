"use client";
import React, { useRef } from "react";
import { CheckCircle } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Benefits() {
    const containerRef = useRef(null);
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
                toggleActions: "play none none reverse",
            }
        });

        tl.fromTo(leftColRef.current,
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
        )
            .fromTo(rightColRef.current.children,
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
                "-=0.6"
            );
    }, { scope: containerRef });

    return (
        <section ref={containerRef} id="benefits" className="py-24 bg-white dark:bg-slate-950 transition-colors overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-16">

                    <div ref={leftColRef} className="w-full md:w-1/2 opacity-0">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 rounded-2xl rotate-2 hover:rotate-0 transition-all duration-500 shadow-2xl">
                            <div className="bg-slate-900 rounded-xl p-8 h-96 flex items-center justify-center text-white/20 text-6xl font-black relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
                                App Preview
                            </div>
                        </div>
                    </div>

                    <div ref={rightColRef} className="w-full md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 opacity-0">
                            Experience the Future of Sharing
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed opacity-0">
                            Stop emailing files to yourself. Stop using USB drives. FileShare
                            brings the simplicity of AirDrop to the open web, working across
                            all your devices seamlessly.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Unlimited file size transfer",
                                "No compression or quality loss",
                                "Works on any browser (Chrome, Safari, Firefox)",
                                "Dark mode & Mobile responsive",
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 opacity-0">
                                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </section>
    );
}
