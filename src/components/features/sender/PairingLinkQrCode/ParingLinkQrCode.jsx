"use client";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Loader2, QrCode as QrIcon } from "lucide-react";
import { usePairingLink } from "@/context/PairingLinkContext";

export default function QRCodeBox() {
  const canvasRef = useRef(null);
  const { link, isLoading, error } = usePairingLink();

  useEffect(() => {
    if (!isLoading && link && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        link,
        {
          width: 220,
          margin: 1,
          scale: 8,
          color: {
            dark: "#0f172a",
            light: "#ffffff"
          }
        },
        (err) => {
          if (err) console.error("QR Code generation error:", err);
        }
      );
    }
  }, [link, isLoading]);

  if (error)
    return (
      <div className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
        Error: {error}
      </div>
    );

  return (
    <div className="relative group">
      <div className="relative flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm w-[250px] h-[250px] transition-all duration-300 group-hover:shadow-lg group-hover:border-slate-200 dark:group-hover:border-slate-700">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Generating QR Code...</p>
          </div>
        ) : !link ? (
          <div className="flex flex-col items-center justify-center h-full w-full gap-3">
            <QrIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No Link Available</p>
          </div>
        ) : (
          <canvas ref={canvasRef} className="rounded-lg block" />
        )}
      </div>
    </div>
  );
}
