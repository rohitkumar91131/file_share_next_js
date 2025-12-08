"use client";

import { createContext, useContext, useState } from "react";
import {
  Check,
  Loader2,
  Wifi,
  ShieldCheck,
  ArrowRightLeft,
  Server,
  Search,
} from "lucide-react";

const ReceivingStatusContext = createContext(null);

export function ReceivingStatusProvider({ children }) {
  const STEPS = [
    {
      id: 1,
      title: "Verifying Session ID",
      subtitle: "Validating the shared link against database...",
      icon: Search,
    },
    {
      id: 2,
      title: "Initializing Connection",
      subtitle: "Creating offer & gathering ICE candidates",
      icon: Wifi,
    },
    {
      id: 3,
      title: "Server Handshake",
      subtitle: "Saving connection offer to the signaling server",
      icon: Server,
    },
    {
      id: 4,
      title: "Awaiting Peer",
      subtitle: "Waiting for the sender to accept connection",
      icon: Loader2,
    },
    {
      id: 5,
      title: "Processing Response",
      subtitle: "Receiving and verifying remote description",
      icon: ArrowRightLeft,
    },
    {
      id: 6,
      title: "Securing Route",
      subtitle: "Exchanging ICE candidates for best path",
      icon: ShieldCheck,
    },
    {
      id: 7,
      title: "Connected",
      subtitle: "Secure P2P tunnel established successfully",
      icon: Check,
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  return (
    <ReceivingStatusContext.Provider
      value={{ steps: STEPS, currentStep, setCurrentStep }}
    >
      {children}
    </ReceivingStatusContext.Provider>
  );
}

export function useReceivingStatus() {
  const ctx = useContext(ReceivingStatusContext);
  if (!ctx) {
    throw new Error(
      "useReceivingStatus must be used inside ReceivingStatusProvider"
    );
  }
  return ctx;
}
