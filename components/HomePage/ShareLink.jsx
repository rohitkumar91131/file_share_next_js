"use client";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { useSenderStatus } from "@/context/SenderSideStatusContext";

export default function ShareLink() {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setCurrentStep, setError  , sessionId , setSessionId} = useSenderStatus();

  useEffect(() => {
    let cancelled = false;

    const getLink = async () => {
      try {
        setCurrentStep(0);
        setError("");

        const res = await fetch("/api/share-link", {
          method: "POST",
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        console.log("Share link data:", data);
        if (!cancelled) {
          setLink(data.link);
          setSessionId(data.shareId);
          setLoading(false);
          setCurrentStep(1);
        }
      } catch (e) {
        if (!cancelled) {
          setLink("");
          setLoading(false);
          setError("Failed to create share link");
        }
      }
    };

    getLink();

    return () => {
      cancelled = true;
    };
  }, [setCurrentStep, setError]);

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 px-4">
      <div className="w-full p-4 sm:p-6 rounded-xl border flex flex-col items-center gap-4">
        <p className="text-center text-xs sm:text-sm text-gray-600">
          Open this link on the receiving device.
        </p>

        <div className="w-full flex items-center gap-2">
          {loading ? (
            <div className="w-full h-10 rounded-lg bg-gray-200 animate-pulse flex items-center px-3 text-sm text-gray-400">
              Creating share link…
            </div>
          ) : (
            <>
              <input
                value={link}
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />

              <button
                onClick={copyLink}
                disabled={!link}
                className="p-2 border rounded-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Copy className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {copied && (
          <p className="text-green-600 text-xs sm:text-sm">Link copied!</p>
        )}
      </div>
    </div>
  );
}
