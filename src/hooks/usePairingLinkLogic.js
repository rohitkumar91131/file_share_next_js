"use client";
import { useEffect, useCallback, useRef } from "react";
import { usePairingLink } from "@/context/PairingLinkContext";
import { useSenderStatus } from "@/context/SenderSideStatusContext";

export const usePairingLinkLogic = () => {
    const {
        setPairingLink,
        setIsLoading,
        setPairingLinkError,
        setLinkExpiry,
        pairingLink,
    } = usePairingLink();

    const { setSessionId, setCurrentStep } = useSenderStatus();
    const hasFetched = useRef(false);

    const generateLink = useCallback(async () => {
        setIsLoading(true);
        setPairingLinkError("");
        // Step 1: Creating Share Link
        setCurrentStep(1);

        try {
            const res = await fetch("/api/share/create-share", { method: "POST" });
            if (!res.ok) throw new Error("Failed to create share session");

            const data = await res.json();
            // Expecting { link: string, shareId: string }

            setPairingLink(data.link);
            setSessionId(data.shareId);

            // Set expiry to 10 minutes from now (UI only)
            setLinkExpiry(Date.now() + 10 * 60 * 1000);

        } catch (err) {
            console.error(err);
            setPairingLinkError("Failed to generate link");
        } finally {
            setIsLoading(false);
        }
    }, [
        setPairingLink,
        setIsLoading,
        setPairingLinkError,
        setLinkExpiry,
        setSessionId,
        setCurrentStep,
    ]);

    // Automatically generate link on mount if not present
    useEffect(() => {
        if (!pairingLink && !hasFetched.current) {
            hasFetched.current = true;
            generateLink();
        }
    }, [pairingLink, generateLink]);

    return { regenerate: generateLink };
};
