"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { WebRTCManager } from "@/services/webrtc";

const WebRTCContext = createContext(null);

export function WebRTCProvider({ children }) {
  // Use useMemo to initialize the manager once.
  // This avoids "accessing ref during render" errors and provides a stable instance.
  const webrtc = useMemo(() => new WebRTCManager(), []);

  const [connectionState, setConnectionState] = useState(null);
  const [connectionType, setConnectionType] = useState('unknown'); // 'lan', 'wifi', 'wan', 'unknown'

  useEffect(() => {
    webrtc.on("onConnectionStateChange", (state) => {
      setConnectionState(state);

      if (state === 'connected') {
        // Check stats after a short delay to allow candidates to settle
        setTimeout(async () => {
          if (!webrtc.pc) return;
          try {
            const stats = await webrtc.pc.getStats();
            let selectedPair = null;

            stats.forEach(report => {
              if (report.type === 'transport' && report.selectedCandidatePairId) {
                selectedPair = stats.get(report.selectedCandidatePairId);
              }
            });

            // Fallback: try to find candidate-pair that is succeeded
            if (!selectedPair) {
              stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.selected) {
                  selectedPair = report;
                }
              });
            }

            if (selectedPair) {
              const localCandidate = stats.get(selectedPair.localCandidateId);
              const remoteCandidate = stats.get(selectedPair.remoteCandidateId);

              console.log("Stats Local:", localCandidate);
              console.log("Stats Remote:", remoteCandidate);

              if (localCandidate && remoteCandidate) {
                // Check candidate types
                // host = local network (LAN/WiFi)
                // srflx = NAT/Internet but could be same WiFi if hairpinnning
                // relay = TURN (Internet)

                if (localCandidate.candidateType === 'host' && remoteCandidate.candidateType === 'host') {
                  // Likely same LAN or WiFi
                  // Try to guess based on networkType if available (Chrome)
                  if (localCandidate.networkType === 'wifi' || remoteCandidate.networkType === 'wifi') {
                    setConnectionType('wifi');
                  } else if (localCandidate.networkType === 'ethernet' || remoteCandidate.networkType === 'ethernet') {
                    setConnectionType('lan');
                  } else {
                    // Default to generalized local
                    setConnectionType('lan');
                  }
                } else {
                  setConnectionType('wan');
                }
              }
            }
          } catch (e) {
            console.error("Error getting stats:", e);
          }
        }, 2000);
      }
    });

    return () => {
      webrtc.close();
    };
  }, [webrtc]);

  const initialize = useCallback(() => {
    return webrtc.initialize();
  }, [webrtc]);

  return (
    <WebRTCContext.Provider
      value={{
        webrtc,
        connectionState,
        setConnectionState,
        connectionType,
        initialize
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
