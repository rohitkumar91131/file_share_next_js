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
import { useGSAP } from '@gsap/react';

export default function SenderView() {
  usePairingLinkLogic();
  useSenderPairingLogic();
  const { connectionState } = useWebRTCStore();

  const pairingSectionRef = useRef(null);
  const [showPairing, setShowPairing] = useState(true);
  const [uploadSpeed, setUploadSpeed] = useState(0);

  // Initial Entrance Animation: Full Screen -> Original Size
  useGSAP(() => {
    if (showPairing && pairingSectionRef.current) {
      const tl = gsap.timeline();

      // We animate FROM a state where it looks like it covers the screen
      // Since we can't easily change `position: fixed` to `static` smoothly without FLIP, 
      // we'll simulate a "large scale" entrance or a layout animation.
      // However, the user specifically asked for "full screen se original size".
      // A common trick is to start with fixed positioning and then swap, but that's complex to get right with React re-renders.
      // Let's try a high-impact scale/position animation that feels like a "zoom out" from the screen.

      tl.from(pairingSectionRef.current, {
        duration: 1.2,
        y: "50vh", // Start from center-ish (relative to its flow usually pushes it down)
        scale: 1.1, // Slight overscale
        opacity: 0,
        ease: "power3.out",
        clearProps: "all"
      });

      // Actually, to make it look like it's coming from full screen, 
      // let's try starting it with fixed positioning properties if possible, 
      // but simpler is often better: huge scale and centered.

      gsap.fromTo(pairingSectionRef.current,
        {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 100,
          borderRadius: 0,
          padding: '20vh', // Center content
          backgroundColor: '#ffffff', // Ensure background covers
          opacity: 0, // Fade in slightly to avoid flash
        },
        {
          position: 'static', // Revert to flow
          // width/height will revert
          // borderRadius will revert
          // padding will revert
          // backgroundColor will revert to class
          opacity: 1,
          zIndex: 1, // Reset
          duration: 1.5,
          ease: "expo.out",
          clearProps: "position,top,left,width,height,zIndex,borderRadius,padding,backgroundColor"
        }
      );
    }
  }, []); // Run once on mount

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
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 origin-center overflow-hidden"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Connect & Share</h2>
            <div className="h-full flex flex-col justify-center"> {/* added div for centering content during full screen anim */}
              <PairingInterface />
            </div>
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
