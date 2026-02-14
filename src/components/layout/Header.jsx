"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle"; // Import ThemeToggle

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Add scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
                : "bg-transparent border-b border-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
                        <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="FileShare Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            FileShare
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {["Features", "How it Works", "Benefits"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm"
                            >
                                {item}
                            </a>
                        ))}

                        <div className="pl-4 border-l border-slate-200 dark:border-slate-700 flex items-center gap-4">
                            <ThemeToggle />
                            <Link
                                href="/share" // Update route
                                className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Start Sharing
                            </Link>
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 absolute w-full transition-all animate-in slide-in-from-top-5">
                    <div className="px-4 pt-4 pb-8 space-y-2 shadow-xl">
                        {["Features", "How it Works", "Benefits"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                                className="block px-4 py-4 text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                        <div className="pt-6 px-2">
                            <Link
                                href="/share" // Update route
                                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                Start Sharing Now
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
