"use client";
import React, { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import PairingInterface from './PairingLinkQrCode/PairingInterface';
import InputBox from './InputBox';
import CurrentConnectionState from './ConnectionStatus/CurrentConnectionState';
import ConnectedStatus from '@/components/shared/ConnectedStatus';
import SpeedStats from '@/components/shared/SpeedStats';
import { usePairingLinkLogic } from '@/hooks/usePairingLinkLogic';
import { useSenderPairingLogic } from '@/hooks/useSenderPairingLogic';
import { useWebRTCStore } from '@/context/webrtc/WebRTCContext';
import gsap from 'gsap';

export default function SenderView() {
  usePairingLinkLogic();
  useSenderPairingLogic();
  const { connectionState } = useWebRTCStore();

  const pairingSectionRef = useRef(null);
  const [showPairing, setShowPairing] = useState(true);
  const [uploadSpeed, setUploadSpeed] = useState(0);

  // Animate out pairing section when connected
  useEffect(() => {
    if (connectionState === 'connected' && showPairing) {
      gsap.to(pairingSectionRef.current, {
        opacity: 0,
        scale: 0.9,
        y: -20,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => setShowPairing(false)
      });
    }
  }, [connectionState, showPairing]);

  return (
    <div className="min-h-screen relative">
      <Navbar />

      {/* Top Right Connected Status */}
      {!showPairing && <ConnectedStatus />}
      {!showPairing && <SpeedStats speed={uploadSpeed} type="upload" />}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Connection Status Badge (Only show if not fully connected or if we want to keep it) */}
        {/* The user asked to transition the QR code into the top right button. 
            So we probably want to hide the main status text once connected too, 
            or keep it for detail? User said "usko... transition kar do", implies replacement.
            I'll hide the generic status bar when connected to reduce clutter. */}
        {showPairing && (
          <section className="flex justify-center">
            <CurrentConnectionState />
          </section>
        )}

        {/* Pairing Section - Animates Out */}
        {showPairing && (
          <section
            ref={pairingSectionRef}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 origin-top"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Connect & Share</h2>
            <PairingInterface />
          </section>
        )}

        {/* File Transfer Section - Always Visible */}
        <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send Files</h2>
          <InputBox onSpeedUpdate={setUploadSpeed} />
        </section>
      </div>
    </div>
  );
}
