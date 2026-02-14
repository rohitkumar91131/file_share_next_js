"use client";
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import PairingStatusReceiverSide from './Loading/PairingStatusReceiverSide';
import FilesList from './FilesList';
import FileReceiver from './FileReceiver';
import ConnectedStatus from '@/components/shared/ConnectedStatus';
import SpeedStats from '@/components/shared/SpeedStats';
import { useReceivingStatus } from '@/context/ReceivingSideStatusContext';
import { useReceiveFileData } from '@/context/ReceiveFileDataContext';
import gsap from 'gsap';

export default function ReceiverView() {
  const { currentStep } = useReceivingStatus();
  const { downloadSpeed } = useReceiveFileData();
  const pairingStatusRef = useRef(null);
  const [showPairingStatus, setShowPairingStatus] = useState(true);

  // Animate out pairing status when connected (Step 7)
  useEffect(() => {
    if (currentStep === 7 && showPairingStatus) {
      gsap.to(pairingStatusRef.current, {
        opacity: 0,
        scale: 0.9,
        y: -20,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => setShowPairingStatus(false)
      });
    }
  }, [currentStep, showPairingStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-black dark:via-slate-950 dark:to-slate-900 transition-colors">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Headless file receiver - handles incoming data */}
        <FileReceiver />

        {/* Top Right Connected Status */}
        {!showPairingStatus && <ConnectedStatus />}
        {!showPairingStatus && <SpeedStats speed={downloadSpeed} type="download" />}

        {/* Pairing Status - Animates Out */}
        {showPairingStatus && (
          <div ref={pairingStatusRef}>
            <PairingStatusReceiverSide />
          </div>
        )}

        {/* Files List */}
        <div className="pb-12">
          <FilesList />
        </div>
      </div>
    </div>
  );
}
