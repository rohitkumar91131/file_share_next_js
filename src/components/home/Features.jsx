"use client";
import React, { useRef } from "react";
import { Shield, Zap, Lock, Smartphone, WifiOff, Globe } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const gridRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse",
            }
        });

        tl.fromTo(headerRef.current.children,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
        )
            .fromTo(gridRef.current.children,
                { y: 50, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" },
                "-=0.4"
            );

    }, { scope: containerRef });

    const handleMouseEnter = (e) => {
        gsap.to(e.currentTarget, {
            y: -10,
            scale: 1.02,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            duration: 0.3,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = (e) => {
        gsap.to(e.currentTarget, {
            y: 0,
            scale: 1,
            boxShadow: "none", // Resetting to default class styled shadow isn't trivial with GSAP inline styles. 
            // Better approach is to animate specific properties and let CSS handle the base state, 
            // or explicitly set the base state here.
            // However, the CSS class has hover:shadow-xl.
            // Let's just clear the inline styles to let CSS take over, or animate back to 'zero' state.
            clearProps: "all",
            duration: 0.3,
            ease: "power2.out"
        });
    };

    return (
        <section ref={containerRef} id="features" className="py-24 bg-white dark:bg-slate-950 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={headerRef} className="text-center mb-16 opacity-0">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Why FileShare?
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Packed with everything you need for fast, secure file sharing. Nothing else.
                    </p>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className="p-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 group opacity-0"
                        // Removed hover classes from CSS as GSAP handles it now, to avoid conflict. 
                        // actually kept them as fallback/base, GSAP generally overrides inline.
                        >
                            <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors duration-300">
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
