"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useSenderStatus } from "@/context/SenderSideStatusContext";
import { WaitForPeerSenderSide } from "@/utils/WaitForPeerSenderSide";
import { sendAnswer } from "@/lib/webrtc/SendAnswer";

export default function PairingStatusSenderSide() {
  const {
    steps: STEPS,
    currentStep,
    error,
    sessionId,
    setCurrentStep,
    setError,
  } = useSenderStatus();

  const pcRef = useRef(null);
  const sessionRef = useRef(null);

  const ensurePeerConnection = () => {
    if (!pcRef.current) {
      pcRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
    }
    return pcRef.current;
  };

  const progressHeight =
    STEPS.length > 1 ? `${(currentStep / (STEPS.length - 1)) * 88}%` : "0%";

  // STEP 1: wait for peer offer, session store karo
  useEffect(() => {
    if (!sessionId) return;
    if (currentStep !== 1) return;

    let cancelled = false;

    const run = async () => {
      try {
        setError("");

        const { found, session } = await WaitForPeerSenderSide(sessionId);
        if (cancelled) return;

        if (!found) {
          setTimeout(() => !cancelled && run(), 1500);
          return;
        }

        sessionRef.current = session || null;
        setCurrentStep(2);
      } catch (err) {
        if (!cancelled) setError("Error while waiting for peer offer");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [sessionId, currentStep, setCurrentStep, setError]);

  // STEP 2: offer + offerCandidates ke saath sendAnswer
  useEffect(() => {
    if (!sessionId) return;
    if (currentStep !== 2) return;

    let cancelled = false;

    const runAnswer = async () => {
      try {
        const session = sessionRef.current;
        if (!session) {
          setError("Session data missing for answer");
          return;
        }

        const offer = session.offer;
        const offerCandidates = session.offerCandidates || [];

        if (!offer) {
          setError("Remote offer not found");
          return;
        }

        const pc = ensurePeerConnection();
        if (!pc) {
          setError("Failed to create PeerConnection on sender side");
          return;
        }

        try {
          await sendAnswer(pc, sessionId, offer, offerCandidates);
        } catch (err) {
          console.error("sendAnswer error:", err);
          setError(typeof err === "string" ? err : "Failed to create answer");
          return;
        }

        if (!cancelled) {
          setCurrentStep(3); // Checking ICE / connected etc
        }
      } catch (err) {
        if (!cancelled) setError("Error while creating answer");
      }
    };

    runAnswer();

    return () => {
      cancelled = true;
      // connection ko aage file transfer ke liye use kar rahe ho to yahan close mat karo
      // if (pcRef.current) {
      //   pcRef.current.close();
      //   pcRef.current = null;
      // }
    };
  }, [sessionId, currentStep, setCurrentStep, setError]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow:hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <p className="text-xs font-bold uppercase text-emerald-400">
                Sender Status
              </p>
            </div>
            <h2 className="text-2xl font-bold">Creating Session</h2>
            <p className="text-slate-400 text-sm mt-1">
              Initializing secure channel for file transfer...
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 relative">
          <div className="absolute left-[47px] sm:left-[55px] top-8 bottom-8 w-0.5 bg-gray-100" />
          <div
            className="absolute left-[47px] sm:left-[55px] top-8 w-0.5 bg-emerald-500 transition-all duration-700"
            style={{ height: progressHeight }}
          />

          <div className="space-y-6 relative">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isPending = index > currentStep;
              const showError = isActive && !!error;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`group flex items-start gap-4 transition-all ${
                    isActive ? "translate-x-1" : ""
                  }`}
                >
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex justify-center items-center border-2 transition-all
                    ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md"
                        : ""
                    }
                    ${
                      isActive && !showError
                        ? "bg-white border-emerald-500 text-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)] scale-110"
                        : ""
                    }
                    ${
                      isActive && showError
                        ? "bg-white border-red-500 text-red-500 shadow-red-100"
                        : ""
                    }
                    ${isPending ? "bg-white border-gray-200 text-gray-300" : ""}`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      Icon && (
                        <Icon
                          className={`w-5 h-5 ${
                            isActive && !error ? "animate-pulse" : ""
                          }`}
                        />
                      )
                    )}
                  </div>

                  <div
                    className={`flex-1 pt-1 transition-all ${
                      isActive
                        ? "opacity-100"
                        : isPending
                        ? "opacity-40"
                        : "opacity-80"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3
                        className={`text-base font-semibold ${
                          isActive
                            ? showError
                              ? "text-red-600"
                              : "text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        {step.title}
                      </h3>

                        {isActive && !error && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full animate-pulse">
                            PROCESSING
                          </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-500 leading-snug mt-0.5">
                      {showError ? (
                        <span className="text-red-500 font-medium">
                          {error}
                        </span>
                      ) : (
                        step.subtitle
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
