"use client";
import React, { createContext, useContext, useState } from "react";

const PairingLinkContext = createContext();

export const PairingLinkProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pairingLink, setPairingLink] = useState("");
  const [pairingLinkError, setPairingLinkError] = useState("");
  const [linkExpiry, setLinkExpiry] = useState(null);

  return (
    <PairingLinkContext.Provider
      value={{
        isLoading,
        setIsLoading,
        pairingLink,
        setPairingLink,
        pairingLinkError,
        setPairingLinkError,
        linkExpiry,
        setLinkExpiry,
        link: pairingLink,
        error: pairingLinkError,
      }}
    >
      {children}
    </PairingLinkContext.Provider>
  );
};

export const usePairingLink = () => {
  const context = useContext(PairingLinkContext);
  if (!context) throw new Error("usePairingLink must be used within a PairingLinkProvider");
  return context;
};
