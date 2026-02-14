"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { useReceivingStatus } from "@/context/ReceivingSideStatusContext";
import { useWebRTCStore } from "@/context/webrtc/WebRTCContext";
import { api } from "@/services/api";
import { toast } from "sonner";

export default function PairingStatusReceiverSide() {
  const { steps: STEPS, currentStep, setCurrentStep } = useReceivingStatus();
  const { id } = useParams();
  const shareId = Array.isArray(id) ? id[0] : id;

  const [error, setError] = useState("");

  const { webrtc, initialize } = useWebRTCStore();

  useEffect(() => {
    if (!shareId) {
      setTimeout(() => setError("Invalid session ID in URL."), 0);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setError("");

      try {
        // 🔹 Step 1: Validate session
        if (currentStep === 0) setCurrentStep(1);

        const result = await api.checkSession(shareId);
        if (cancelled) return;

        if (!result.ok) {
          setError(result.error || "Session validation failed.");
          return;
        }

        // 🔹 Step 2: Create PeerConnection
        setCurrentStep(2);

        let pc = webrtc.pc;

        if (!pc) {
          pc = webrtc.initialize();

          const dc = webrtc.createDataChannel("file-transfer");

          if (!pc) {
            setError("WebRTC not supported in this environment.");
            return;
          }

          dc.addEventListener("open", () => {
            console.log("✅ [RECEIVER] Data Channel Open!");
            toast.success("Connection established!");
            if (!cancelled) setCurrentStep(7);
          });

          dc.addEventListener("close", () => {
            console.log("❌ [RECEIVER] Data Channel Closed!");
            toast.error("Connection closed!");
          });

          // Monitor peer connection state
          const onConnectionStateChange = () => {
            console.log("🔌 [RECEIVER] Connection State:", pc.connectionState);
            if (pc.connectionState === 'disconnected') {
              toast.warning("Peer connection disconnected!");
            } else if (pc.connectionState === 'failed') {
              toast.error("Peer connection failed!");
            } else if (pc.connectionState === 'connected') {
              toast.success("Peer connection connected!");
            }
          };
          pc.addEventListener("connectionstatechange", onConnectionStateChange);
        }

        // 🔹 Step 3: Send offer to server
        if (cancelled) return;

        // Setup ICE candidate sending
        webrtc.on("onIceCandidate", async (candidate) => {
          if (candidate) await api.sendOfferCandidate(shareId, candidate);
        });

        const offer = await webrtc.createOffer();
        await api.sendOffer(shareId, offer);

        setCurrentStep(3); // Handshake

        // 🔹 Step 4: Wait for Peer Answer
        setCurrentStep(4); // Awaiting Peer

        const waitForAnswerLoop = async () => {
          if (cancelled) return;

          try {
            const result = await api.checkAnswer(shareId);
            if (cancelled) return;
            // console.log("🔍 [RECEIVER] CheckAnswer result:", result.found);

            if (!result.found) {
              setTimeout(() => {
                if (!cancelled && currentStep < 5) waitForAnswerLoop();
              }, 1500);
              return;
            }

            // 🔹 Step 5: Processing Response
            setCurrentStep(5);

            const session = result.session;
            const answer = session?.answer;
            const answerCandidates = session?.answerCandidates || [];

            if (!answer) {
              setError("Session found but answer data is missing.");
              return;
            }

            // Remote description
            if (pc.signalingState !== "stable") {
              await webrtc.setRemoteDescription(answer);
            }

            // 🔹 Step 6: Securing Route (ICE Candidates)
            setCurrentStep(6);
            console.log("🔧 [RECEIVER] Adding ICE candidates:", answerCandidates.length);

            for (const cand of answerCandidates) {
              await webrtc.addIceCandidate(cand);
            }
            console.log("✅ [RECEIVER] ICE candidates added. Waiting for connection state change...");

          } catch (err) {
            console.error("❌ [RECEIVER] Error while waiting for answer:", err);
            if (!cancelled) setError("Error while connecting to peer.");
          }
        };

        waitForAnswerLoop();
      } catch (e) {
        console.error("❌ [RECEIVER] Connection Error:", e);
        if (!cancelled) setError("Connection failed. Please refresh.");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [shareId, setCurrentStep, webrtc, initialize]);

  if (!STEPS || !STEPS.length) return null;
  const progressHeight = STEPS.length > 1 ? `${(currentStep / STEPS.length) * 100}%` : "0%";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="bg-slate-900 dark:bg-black p-6 sm:p-8 text-white relative overflow-hidden border-b border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${currentStep === 7 ? "" : "animate-ping"}`} />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <p className="text-xs font-bold tracking-wider uppercase text-emerald-400">Receiver Status</p>
            </div>
            <h2 className="text-2xl font-bold">{currentStep === 7 ? "Connected!" : "Joining Session"}</h2>
            <p className="text-slate-400 text-sm mt-1">{currentStep === 7 ? "Secure P2P tunnel established." : "Validating link and establishing secure tunnel..."}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 relative">
          <div className="absolute left-[47px] sm:left-[55px] top-8 bottom-8 w-0.5 bg-gray-100 dark:bg-slate-800" />
          <div className="absolute left-[47px] sm:left-[55px] top-8 w-0.5 bg-emerald-500 transition-all duration-700 ease-out" style={{ height: progressHeight, maxHeight: "88%" }} />

          <div className="space-y-6 relative">
            {STEPS.map((step) => {
              const stepIndex = step.id;
              const isCompleted = stepIndex < currentStep;
              const isActive = stepIndex === currentStep;
              const isPending = stepIndex > currentStep;
              const showError = isActive && error;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className={`group flex items-start gap-4 transition-all duration-500 ${isActive ? "translate-x-1" : ""}`}>
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 
                    ${isCompleted || (isActive && step.id === 7) ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/50" : ""} 
                    ${isActive && !showError && step.id !== 7 ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)] scale-110" : ""} 
                    ${isActive && showError ? "bg-white dark:bg-slate-900 border-red-500 text-red-500 shadow-red-100 dark:shadow-red-900/30" : ""} 
                    ${isPending ? "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-300 dark:text-slate-600" : ""} bg-white dark:bg-slate-900`}>
                    {isCompleted || (isActive && step.id === 7) ? <Check className="w-5 h-5" /> : StepIcon && <StepIcon className={`w-5 h-5 ${isActive && !error ? "animate-pulse" : ""}`} />}
                  </div>
                  <div className={`flex-1 pt-1 transition-all duration-500 ${isActive ? "opacity-100" : isPending ? "opacity-40" : "opacity-80"}`}>
                    <div className="flex justify-between items-center">
                      <h3 className={`text-base font-semibold ${isActive ? (showError ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white") : "text-slate-700 dark:text-slate-300"}`}>{step.title}</h3>
                      {isActive && !error && step.id !== 7 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 animate-pulse">PROCESSING</span>}
                      {isActive && step.id === 7 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">SUCCESS</span>}
                      {isActive && showError && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">FAILED</span>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{showError ? <span className="text-red-500 dark:text-red-400 font-medium">{error}</span> : step.subtitle}</p>
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