"use client";
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
            <Header />
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
                    Privacy Policy
                </h1>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="lead text-xl text-slate-600 dark:text-slate-400 mb-8">
                        Your privacy is our priority. FileShare is designed to be secure, private, and ephemeral.
                    </p>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            1. No Data Collection
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            FileShare is a peer-to-peer (P2P) file sharing service. When you share a file, it is streamed
                            directly from your device to the receiver's device using WebRTC technology.
                            <strong> We do not store your files on our servers.</strong> We do not collect personal usage data,
                            IP addresses, or browse history.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            2. Ephemeral Signaling Data
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            To establish a P2P connection, a small amount of signaling data (SDP and ICE candidates)
                            is temporarily passed through our signaling server. This data contains technical information needed
                            to connect devcies and is strictly ephemeral. It is not stored or logged once the connection is established.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            3. Cookies and Local Storage
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We use local storage solely for functional purposes, such as remembering your theme preference
                            (light/dark mode). We do not use cookies for tracking or advertising purposes.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            4. Open Source
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            FileShare is an open-source project. You can inspect the source code on
                            <a href="https://github.com/rohitkumar91131/file_share_next_js" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                                GitHub
                            </a> to verify our security and privacy claims.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                            5. Contact
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            If you have any questions about this policy, please reach out via our GitHub repository issues.
                        </p>
                    </section>

                    <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
