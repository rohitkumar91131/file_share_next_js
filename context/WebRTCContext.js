"use client";

import { createContext, useContext, useRef, useCallback } from "react";

const WebRTCContext = createContext(null);

export function WebRTCProvider({ children }) {
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  const offerRef = useRef(null);
  const answerRef = useRef(null);
  const offerCandidatesRef = useRef([]);
  const answerCandidatesRef = useRef([]);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.error("Error closing existing PeerConnection", e);
      }
      peerConnectionRef.current = null;
      dataChannelRef.current = null;

      // reset signaling data on fresh PC
      offerRef.current = null;
      answerRef.current = null;
      offerCandidatesRef.current = [];
      answerCandidatesRef.current = [];
    }

    if (typeof window === "undefined" || !window.RTCPeerConnection) {
      console.error("RTCPeerConnection not available");
      return { pc: null, dc: null };
    }

    const pc = new window.RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    console.log("Created new RTCPeerConnection", pc);

    const dc = pc.createDataChannel("file-transfer");
    console.log("Created new DataChannel", dc);

    peerConnectionRef.current = pc;
    dataChannelRef.current = dc;

    return { pc, dc };
  }, []);

  return (
    <WebRTCContext.Provider
      value={{
        peerConnectionRef,
        dataChannelRef,
        createPeerConnection,

        // 🔹 expose signaling refs
        offerRef,
        answerRef,
        offerCandidatesRef,
        answerCandidatesRef,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTCStore() {
  const ctx = useContext(WebRTCContext);
  if (!ctx) {
    throw new Error("useWebRTCStore must be used inside WebRTCProvider");
  }
  return ctx;
}
