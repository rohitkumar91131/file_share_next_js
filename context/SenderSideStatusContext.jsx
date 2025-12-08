"use client";

import { createContext, useContext, useState } from "react";
import { Check, Link, Users, FileKey, Network } from "lucide-react";

const SenderStatusContext = createContext(null);

const STEPS = [
  {
    id: 1,
    title: "Creating Share Link",
    subtitle: "Generating unique session ID...",
    icon: Link,
  },
  {
    id: 2,
    title: "Waiting for Peer Offer",
    subtitle: "Waiting for receiver to join...",
    icon: Users,
  },
  {
    id: 3,
    title: "Creating Answer",
    subtitle: "Generating secure connection answer...",
    icon: FileKey,
  },
  {
    id: 4,
    title: "Checking ICE Candidates",
    subtitle: "Finalizing network path...",
    icon: Network,
  },
];

export function SenderStatusProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [sessionId , setSessionId] = useState(null);

  return (
    <SenderStatusContext.Provider
      value={{
        steps: STEPS,
        currentStep,
        setCurrentStep,
        error,
        setError,
        sessionId , setSessionId
      }}
    >
      {children}
    </SenderStatusContext.Provider>
  );
}

export function useSenderStatus() {
  const ctx = useContext(SenderStatusContext);
  if (!ctx) {
    throw new Error("useSenderStatus must be used inside SenderStatusProvider");
  }
  return ctx;
}
