"use client";

import { useSenderStatus } from "@/context/SenderSideStatusContext";
import SenderStatusSummary from "./SenderStatusSummary";
import PairingStatusSenderSide from "./ConnectionStatus/PairingStatusSenderSide";
import { AnimatePresence } from "framer-motion";

export default function SenderAnimationWrapper() {
  const { isOpen } = useSenderStatus();

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      
      <AnimatePresence mode="wait">
        {!isOpen ? (
            
          /* 1. Small Summary Card */
          <div key="summary" className="z-10">
             <SenderStatusSummary />
          </div>

        ) : (

          /* 2. Full Detailed Modal */
          <div key="detail" className="fixed inset-0 z-50 flex items-center justify-center">
             <PairingStatusSenderSide />
          </div>

        )}
      </AnimatePresence>

    </div>
  );
}