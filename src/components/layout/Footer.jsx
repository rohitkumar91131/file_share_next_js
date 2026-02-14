"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-12 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Image
                            src="/logo.png"
                            alt="FileShare Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-slate-900 dark:text-slate-200 font-bold text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        FileShare
                    </span>
                </Link>

                <div className="text-slate-500 dark:text-slate-400 text-sm">
                    © {new Date().getFullYear()} FileShare. Open Source.
                </div>

                <div className="flex gap-6 text-slate-600 dark:text-slate-400 font-medium text-sm">
                    <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Github</a>
                    <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Twitter</a>
                </div>
            </div>
        </footer>
    );
}
