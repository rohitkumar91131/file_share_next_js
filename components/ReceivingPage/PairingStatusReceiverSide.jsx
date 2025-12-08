"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { useReceivingStatus } from "@/context/ReceivingSideStatusContext";
import { checkSessionId } from "@/utils/checkSessionId";
import { sendOffer } from "@/lib/webrtc/SendOffer";
import { useWebRTCStore } from "@/context/WebRTCContext";
import { WaitForPeerReceiverSide } from "../../utils/WaitingPeerReceiverSide";

export default function PairingStatusReceiverSide() {
  const { steps: STEPS, currentStep, setCurrentStep } = useReceivingStatus();
  const { id } = useParams();
  const shareId = Array.isArray(id) ? id[0] : id;

  const [error, setError] = useState("");
  const { createPeerConnection } = useWebRTCStore();

  useEffect(() => {
    if (!shareId) {
      setError("Invalid session ID in URL.");
      return;
    }

    let cancelled = false;
    let pcInstance = null;

    const run = async () => {
      setError("");

      try {
        // 🔹 Step 0 → Validate session
        const result = await checkSessionId(shareId);
        if (cancelled) return;

        if (!result.ok) {
          setError(result.error || "Session validation failed.");
          setCurrentStep(0);
          return;
        }

        // ✅ Session valid
        setCurrentStep(1);

        // 🔹 Step 1 → Create PeerConnection
        const { pc, dc } = createPeerConnection();
        if (!pc) {
          setError("WebRTC not supported in this environment.");
          return;
        }
        pcInstance = pc;

        dc.onopen = () => console.log("Data Channel Open!");
        dc.onmessage = (e) => console.log("Message received:", e.data);

        setCurrentStep(2);

        // 🔹 Step 2 → Send offer to server
        if (cancelled) return;
        await sendOffer(pc, shareId);
        if (cancelled) return;

        // Offer & offer candidates saved on server
        setCurrentStep(3); // "Awaiting Peer"

        // 🔹 Step 3 → WAIT for ANSWER from sender (polling)
        const waitForAnswerLoop = async () => {
          if (cancelled) return;

          try {
            const { found, session } = await WaitForPeerReceiverSide(shareId);
            if (cancelled) return;

            if (!found) {
              // answer abhi nahi aaya, thodi der baad fir se
              setTimeout(() => {
                if (!cancelled) waitForAnswerLoop();
              }, 1500);
              return;
            }

            // ✅ Answer mil gaya
            setCurrentStep(4); // "Processing Response"

            const answer = session?.answer;
            const answerCandidates = session?.answerCandidates || [];

            if (!answer) {
              setError("Answer found flag is true but no answer in session.");
              return;
            }

            // Apply remote answer
            await pc.setRemoteDescription(answer);

            // Apply ICE candidates from sender (answer candidates)
            for (const cand of answerCandidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
                console.log("Added answer ICE candidate:", cand);
              } catch (err) {
                console.error("Failed to add answer ICE candidate:", err);
              }
            }

            setCurrentStep(5); // "Securing Route" / almost connected
          } catch (err) {
            console.error("Error while waiting for answer:", err);
            if (!cancelled) {
              setError("Error while waiting for remote answer.");
            }
          }
        };

        waitForAnswerLoop();
      } catch (e) {
        console.error("Connection Error:", e);
        if (!cancelled) {
          setError("Connection failed. Please refresh the page.");
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (pcInstance) {
        try {
          pcInstance.close();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [shareId, setCurrentStep, createPeerConnection]);

  if (!STEPS || !STEPS.length) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <p className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                Receiver Status
              </p>
            </div>
            <h2 className="text-2xl font-bold">Joining Session</h2>
            <p className="text-slate-400 text-sm mt-1">
              Validating link and establishing secure tunnel...
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 relative">
          <div className="absolute left-[47px] sm:left-[55px] top-8 bottom-8 w-0.5 bg-gray-100" />
          <div
            className="absolute left-[47px] sm:left-[55px] top-8 w-0.5 bg-emerald-500 transition-all duration-700 ease-out"
            style={{
              height: `${(currentStep / (STEPS.length - 1)) * 88}%`,
            }}
          />

          <div className="space-y-6 relative">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isPending = index > currentStep;
              const showError = isActive && error;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`group flex items-start gap-4 transition-all duration-500 ${
                    isActive ? "translate-x-1" : ""
                  }`}
                >
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                        : ""
                    }
                    ${
                      isActive
                        ? showError
                          ? "bg-white border-red-500 text-red-500 shadow-red-100"
                          : "bg-white border-emerald-500 text-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)] scale-110"
                        : ""
                    }
                    ${
                      isPending
                        ? "bg-white border-gray-200 text-gray-300"
                        : ""
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      StepIcon && (
                        <StepIcon
                          className={`w-5 h-5 ${
                            isActive && !error ? "animate-pulse" : ""
                          }`}
                        />
                      )
                    )}
                  </div>
                  <div
                    className={`flex-1 pt-1 transition-all duration-500 ${
                      isActive ? "opacity-100" : isPending ? "opacity-40" : "opacity-80"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3
                        className={`text-base font-semibold ${
                          isActive
                            ? showError ? "text-red-600" : "text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {isActive && !error && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 animate-pulse">
                          PROCESSING
                        </span>
                      )}
                      {isActive && showError && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          FAILED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 leading-snug">
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
