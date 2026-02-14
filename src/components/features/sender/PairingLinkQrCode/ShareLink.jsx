"use client";
import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { usePairingLink } from "@/context/PairingLinkContext";
import { motion, AnimatePresence } from "framer-motion";

export default function PairingLink() {
  const [copied, setCopied] = useState(false);
  const { link, isLoading, error } = usePairingLink();

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { }
  };

  if (error)
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center flex items-center justify-center gap-2">
        <span className="font-semibold">Error:</span> {error}
      </div>
    );

  return (
    <div className="w-full space-y-3">
      {isLoading ? (
        <div className="w-full h-[52px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center px-4 gap-3 border border-slate-200 dark:border-slate-700">
          <Link2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />
          <div className="h-2.5 w-48 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      ) : (
        <div className="relative flex items-center group">
          <div className="absolute left-4 text-slate-400 dark:text-slate-500 z-10">
            <Link2 className="w-5 h-5" />
          </div>

          <input
            value={link}
            readOnly
            onClick={(e) => e.target.select()}
            className="w-full pl-12 pr-14 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-mono text-slate-700 dark:text-slate-300 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all truncate"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button
              onClick={copyLink}
              disabled={!link}
              className={`p-2.5 rounded-lg transition-all duration-200 ${copied
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 active:scale-95"
                }`}
              title="Copy to clipboard"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Copy className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      )}

      {/* Copy Feedback */}
      <div className="h-6 flex justify-center overflow-hidden relative">
        <AnimatePresence>
          {copied && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 absolute"
            >
              <Check className="w-3.5 h-3.5" />
              Copied to clipboard!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
