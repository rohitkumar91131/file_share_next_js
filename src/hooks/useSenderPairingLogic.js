"use client";
import { useEffect, useRef, useCallback } from "react";
import { useSenderStatus } from "@/context/SenderSideStatusContext";
import { useWebRTCStore } from "@/context/webrtc/WebRTCContext";
import { api } from "@/services/api";

export const useSenderPairingLogic = () => {
  const { currentStep, sessionId, setCurrentStep, setError } = useSenderStatus();
  const { webrtc, setConnectionState } = useWebRTCStore();
  const sessionRef = useRef(null);

  const ensurePeerConnection = useCallback(() => {
    if (!webrtc.pc) {
      webrtc.initialize();

      webrtc.on("onDataChannel", (channel) => {
        channel.onopen = () => {
          setCurrentStep(5);
          setConnectionState("connected");
        };
        channel.onmessage = (e) => console.log("Msg received:", e.data);
      });

      webrtc.on("onConnectionStateChange", (state) => {
        if (state === "disconnected" || state === "failed") {
          setError("Network connection failed");
        }
      });

      setConnectionState("new");
    }
    return webrtc.pc;
  }, [webrtc, setCurrentStep, setError, setConnectionState]);

  useEffect(() => {
    if (!sessionId || currentStep !== 1) return;
    let cancelled = false;

    const run = async () => {
      try {
        setError("");
        // REPLACED WaitForPeerSenderSide with api.checkOffer
        const result = await api.checkOffer(sessionId);
        if (cancelled) return;

        if (!result.found) {
          setTimeout(() => !cancelled && run(), 1500);
          return;
        }

        sessionRef.current = result.session || null;
        setCurrentStep(2);

        setConnectionState("waiting for offer");
      } catch (err) {
        if (!cancelled) setError("Error while waiting for peer offer");
      }
    };

    run();
    return () => { cancelled = true; };
  }, [sessionId, currentStep, setCurrentStep, setError, setConnectionState]);

  useEffect(() => {
    if (!sessionId || currentStep !== 2) return;
    let cancelled = false;

    const runAnswer = async () => {
      try {
        const session = sessionRef.current;
        if (!session || !session.offer) {
          setError("Session/Offer data missing");
          return;
        }

        ensurePeerConnection(); // Initializes webrtc

        // Setup ICE candidate sending
        webrtc.on("onIceCandidate", async (candidate) => {
          if (candidate) await api.sendAnswerCandidate(sessionId, candidate);
        });

        const offer = session.offer;
        const offerCandidates = session.offerCandidates || [];

        await webrtc.setRemoteDescription(offer);
        if (cancelled) return;

        for (const cand of offerCandidates) {
          if (cancelled) return;
          await webrtc.addIceCandidate(cand);
        }

        if (cancelled) return;

        const answer = await webrtc.createAnswer();
        if (cancelled) return;

        if (answer) {
          await api.sendAnswer(sessionId, answer);
        }

        setConnectionState("answer sent");
        if (!cancelled) setCurrentStep(4);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Error while creating answer");
      }
    };

    runAnswer();
    return () => { cancelled = true; };
  }, [sessionId, currentStep, setCurrentStep, setError, webrtc, setConnectionState, ensurePeerConnection]);

};