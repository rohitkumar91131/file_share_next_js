"use client";
import { usePairingLink } from "@/context/PairingLinkContext";
import { useEffect, useMemo, useState } from "react";
import QRCodeBox from "./ParingLinkQrCode";
import PairingLink from "./ShareLink";
import { useSenderPairingLogic } from "@/hooks/useSenderPairingLogic";
import { usePairingLinkLogic } from "@/hooks/usePairingLinkLogic";

export default function PairingInterface() {
  const { regenerate } = usePairingLinkLogic();
  useSenderPairingLogic();

  const { isLoading, linkExpiry, setPairingLink, setPairingLinkError } = usePairingLink();

  // State for the visual timer (UI only)
  const [remainingMs, setRemainingMs] = useState(0);

  // Sync remainingMs whenever linkExpiry changes or every second
  useEffect(() => {
    if (!linkExpiry) {
      setTimeout(() => setRemainingMs(0), 0);
      return;
    }

    // Immediate update to prevent stale 0 state
    setTimeout(() => setRemainingMs(Math.max(0, linkExpiry - Date.now())), 0);

    const t = setInterval(() => {
      setRemainingMs(Math.max(0, linkExpiry - Date.now()));
    }, 500);

    return () => clearInterval(t);
  }, [linkExpiry]);

  // Check expiration directly against Date.now()
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now();
      const expired = !isLoading && linkExpiry && (linkExpiry < now);
      setIsExpired(!!expired);

      if (expired) {
        setPairingLink("");
        setPairingLinkError("Pairing link expired");
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);

  }, [isLoading, linkExpiry, setPairingLink, setPairingLinkError]);


  const remaining = useMemo(() => {
    const s = Math.floor(remainingMs / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [remainingMs]);

  return (
    <div className="flex items-center justify-center w-full px-2 py-4 md:py-8">
      {/* Main Container */}
      <div className="relative w-full max-w-sm md:max-w-4xl bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] shadow-xl md:shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 transition-all duration-300">

        {/* --- EXPIRED OVERLAY --- */}
        {isExpired && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/90 backdrop-blur-md transition-all duration-500 animate-in fade-in">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4 shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
              <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">Link Expired</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-6 max-w-[200px] md:max-w-xs text-center">
              This pairing session has timed out for security reasons.
            </p>
            <button
              onClick={() => {
                setIsExpired(false);
                regenerate();
              }}
              className="px-6 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:bg-slate-800 dark:hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.051M20.418 9c-.965 3.638-3.286 6-7.418 6A9 9 0 014 9M20 20v-5h-.051M3.582 15c.965-3.638 3.286-6 7.418-6A9 9 0 0120 15" />
              </svg>
              Regenerate Link
            </button>
          </div>
        )}

        {/* Background Decorative Blurs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-50 md:opacity-100" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/80 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2 opacity-50 md:opacity-100" />

        {/* Layout */}
        <div className={`relative grid grid-cols-1 md:grid-cols-2 md:divide-x divide-slate-100 dark:divide-slate-800 ${isExpired ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>

          {/* LEFT SIDE: QR & Header */}
          <div className="p-5 md:p-8 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="text-center mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                Pair Device
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                Scan QR or use link below
              </p>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-300 to-blue-300 dark:from-emerald-900 dark:to-blue-900 rounded-xl blur opacity-20 md:opacity-0 md:group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-white p-2 md:p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 dark:bg-white">
                <div className="scale-90 md:scale-100">
                  <QRCodeBox />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Controls & Link */}
          <div className="p-5 md:p-8 flex flex-col justify-center bg-slate-50/50 dark:bg-slate-900/50 md:bg-slate-50/30 backdrop-blur-sm border-t md:border-t-0 border-slate-100 dark:border-slate-800">

            <div className="hidden md:block mb-6">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Link Options</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Alternative connection method</p>
            </div>

            {/* Timer & Retry */}
            <div className="flex items-center justify-between gap-3 mb-4 md:mb-8 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2 md:h-3 md:w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${remainingMs > 10000 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-full w-full ${remainingMs > 10000 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </div>
                <div className="flex flex-col">
                  <span className="hidden md:block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Expires in</span>
                  <span className={`font-mono text-sm md:text-lg font-semibold leading-none ${remainingMs < 10000 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                    {remaining}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsExpired(false);
                  regenerate();
                }}
                disabled={isLoading}
                className={`
                  px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all
                  ${isLoading
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 hover:text-white text-slate-600 dark:text-slate-200 active:scale-95"
                  }
                `}
              >
                {isLoading ? "..." : "Reset"}
              </button>
            </div>

            <div className="hidden md:flex relative items-center py-2 mb-8">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or Share Link</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <div className="w-full">
              <PairingLink />
            </div>

            <div className="mt-4 md:mt-8 flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              <span className="text-[10px] font-medium uppercase tracking-widest">E2E Encrypted</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}