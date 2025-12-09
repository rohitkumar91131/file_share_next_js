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
  
  // Store se refs aur create function nikala
  const { createPeerConnection, peerConnectionRef } = useWebRTCStore();

  useEffect(() => {
    if (!shareId) {
      setError("Invalid session ID in URL.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setError("");

      try {
        // 🔹 Step 1: Validate session
        if (currentStep === 0) setCurrentStep(1);
        
        const result = await checkSessionId(shareId);
        if (cancelled) return;

        if (!result.ok) {
          setError(result.error || "Session validation failed.");
          return;
        }

        // 🔹 Step 2: Create PeerConnection
        setCurrentStep(2);

        // Check agar PC already store me hai toh naya mat banao
        let pc = peerConnectionRef.current;
        
        if (!pc) {
            const { pc: newPc, dc } = createPeerConnection();
            pc = newPc;

            if (!pc) {
               setError("WebRTC not supported in this environment.");
               return;
            }

            // ---------------------------------------------------
            // IMPORTANT: Connected Step Trigger (Step 7)
            // ---------------------------------------------------
            dc.onopen = () => {
                console.log("✅ Data Channel Open (Receiver Side)!");
                if (!cancelled) setCurrentStep(7); // Trigger Connected
            };
            
            dc.onmessage = (e) => console.log("Message received:", e.data);
        }

        // 🔹 Step 3: Send offer to server
        if (cancelled) return;
        await sendOffer(pc, shareId);
        setCurrentStep(3); // Handshake

        // 🔹 Step 4: Wait for Peer Answer
        setCurrentStep(4); // Awaiting Peer

        const waitForAnswerLoop = async () => {
          if (cancelled) return;

          try {
            const { found, session } = await WaitForPeerReceiverSide(shareId);
            if (cancelled) return;

            if (!found) {
              // Retry loop
              setTimeout(() => {
                if (!cancelled && currentStep < 5) waitForAnswerLoop();
              }, 1500);
              return;
            }

            // 🔹 Step 5: Processing Response
            setCurrentStep(5);

            const answer = session?.answer;
            const answerCandidates = session?.answerCandidates || [];

            if (!answer) {
              setError("Session found but answer data is missing.");
              return;
            }

            // Remote description set karo (agar stable nahi hai)
            if (pc.signalingState !== "stable") {
                 await pc.setRemoteDescription(answer);
            }

            // 🔹 Step 6: Securing Route (ICE Candidates)
            setCurrentStep(6);

            for (const cand of answerCandidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (err) {
                console.warn("ICE Candidate Error:", err);
              }
            }

            // Note: Ab hum 'dc.onopen' ka wait kar rahe hain jo Step 7 trigger karega
            
          } catch (err) {
            console.error("Error while waiting for answer:", err);
            if (!cancelled) setError("Error while connecting to peer.");
          }
        };

        waitForAnswerLoop();
      } catch (e) {
        console.error("Connection Error:", e);
        if (!cancelled) setError("Connection failed. Please refresh.");
      }
    };

    run();

    return () => {
      cancelled = true;
      // Close mat karna yahan, file transfer ke liye connection chahiye
    };
  }, [shareId, setCurrentStep, createPeerConnection, peerConnectionRef]); // Dependencies updated

  if (!STEPS || !STEPS.length) return null;

  // Progress Bar Logic
  const progressHeight = STEPS.length > 1 ? `${(currentStep / STEPS.length) * 100}%` : "0%";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-3 w-3 relative">
                {/* Ping animation stop karo agar connected hai */}
                <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${currentStep === 7 ? "" : "animate-ping"}`} />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <p className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                Receiver Status
              </p>
            </div>
            <h2 className="text-2xl font-bold">
                {currentStep === 7 ? "Connected!" : "Joining Session"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
                {currentStep === 7 ? "Secure P2P tunnel established." : "Validating link and establishing secure tunnel..."}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 relative">
          <div className="absolute left-[47px] sm:left-[55px] top-8 bottom-8 w-0.5 bg-gray-100" />
          <div
            className="absolute left-[47px] sm:left-[55px] top-8 w-0.5 bg-emerald-500 transition-all duration-700 ease-out"
            style={{
              height: progressHeight,
              maxHeight: "88%" // Line ko overflow hone se rokne ke liye
            }}
          />

          <div className="space-y-6 relative">
            {STEPS.map((step, index) => {
              const stepIndex = step.id; // 1-based ID
              const isCompleted = stepIndex < currentStep;
              const isActive = stepIndex === currentStep;
              const isPending = stepIndex > currentStep;
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
                      isCompleted || (isActive && step.id === 7)
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                        : ""
                    }
                    ${
                      isActive && !showError && step.id !== 7
                        ? "bg-white border-emerald-500 text-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)] scale-110"
                        : ""
                    }
                    ${
                      isActive && showError
                        ? "bg-white border-red-500 text-red-500 shadow-red-100"
                        : ""
                    }
                    ${
                      isPending
                        ? "bg-white border-gray-200 text-gray-300"
                        : ""
                    }`}
                  >
                    {isCompleted || (isActive && step.id === 7) ? (
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
                      
                      {/* Processing Badge */}
                      {isActive && !error && step.id !== 7 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 animate-pulse">
                          PROCESSING
                        </span>
                      )}

                      {/* Success Badge for Connected Step */}
                      {isActive && step.id === 7 && (
                         <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          SUCCESS
                        </span>
                      )}

                      {/* Error Badge */}
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