"use client";

import { createContext, useContext, useState } from "react";
import {
  Loader2,
  Wifi,
  ShieldCheck,
  ArrowRightLeft,
  Server,
  Search,
  Zap,
} from "lucide-react";

const ReceivingStatusContext = createContext(null);

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
    subtitle: "Creating secure channel & gathering candidates",
    icon: Wifi,
  },
  {
    id: 3,
    title: "Server Handshake",
    subtitle: "Sending connection offer to the signaling server",
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
    icon: Zap,
  },
];

export function ReceivingStatusProvider({ children }) {
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