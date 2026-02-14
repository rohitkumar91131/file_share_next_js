"use client";
import React from "react";
import { Check, Loader2, Link as LinkIcon, Users, FileKey, Network, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSenderPairingLogic } from "@/hooks/useSenderPairingLogic";
import { useSenderStatus } from "@/context/SenderSideStatusContext";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const itemVariants = { hidden: { opacity: 0, x: -20, y: 10 }, visible: { opacity: 1, x: 0, y: 0 } };

export default function PairingStatusSenderSide() {
  useSenderPairingLogic();
  
  const { steps: STEPS, currentStep, error } = useSenderStatus();

  // Map icons to steps (done here to avoid circular dependencies in context)
  const steps = STEPS.map((s) => {
    if (s.id === 1) return { ...s, icon: LinkIcon };
    if (s.id === 2) return { ...s, icon: Users };
    if (s.id === 3) return { ...s, icon: FileKey };
    if (s.id === 4) return { ...s, icon: Network };
    if (s.id === 5) return { ...s, icon: Zap };
    return s;
  });

  const progressHeight = steps.length > 1 ? `${(currentStep / (steps.length - 1)) * 88}%` : "0%";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Area */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-3 w-3 relative">
                {currentStep !== 5 && (
                  <motion.span animate={{ scale: [1, 2], opacity: [0.7, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                )}
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <p className="text-xs font-bold uppercase text-emerald-400">Sender Status</p>
            </div>
            <motion.h2 key={currentStep === 5 ? "done" : "working"} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold">{currentStep === 5 ? "Connected!" : "Creating Session"}</motion.h2>
            <p className="text-slate-400 text-sm mt-1">{currentStep === 5 ? "Secure channel established." : "Initializing secure channel..."}</p>
          </div>
        </div>

        {/* Steps List */}
        <div className="p-6 sm:p-8 relative">
          <div className="absolute left-[47px] sm:left-[55px] top-8 bottom-8 w-0.5 bg-gray-100" />
          <motion.div className="absolute left-[47px] sm:left-[55px] top-8 w-0.5 bg-emerald-500" initial={{ height: "0%" }} animate={{ height: progressHeight }} transition={{ type: "spring", stiffness: 100, damping: 20 }} />

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 relative">
            {steps.map((step) => {
              const stepIndex = step.id;
              const isCompleted = stepIndex < currentStep;
              const isActive = stepIndex === currentStep;
              const isPending = stepIndex > currentStep;
              const showError = isActive && !!error;
              const Icon = step.icon;

              return (
                <motion.div key={step.id} variants={itemVariants} className={`group flex items-start gap-4 relative z-10`}>
                  <motion.div layout initial={false} animate={{ backgroundColor: isCompleted || (isActive && step.id === 5) ? "#10B981" : "#ffffff", borderColor: isCompleted || (isActive && step.id === 5) ? "#10B981" : isActive && showError ? "#EF4444" : isActive ? "#10B981" : "#E5E7EB", scale: isActive ? 1.1 : 1 }} transition={{ duration: 0.3 }} className={`flex-shrink-0 w-10 h-10 rounded-full flex justify-center items-center border-2 shadow-sm`} style={{ boxShadow: isActive && !showError && step.id !== 5 ? "0 0 0 4px rgba(16,185,129,0.15)" : "none" }}>
                    <AnimatePresence mode="wait">
                      {isCompleted || (isActive && step.id === 5) ? (
                        <motion.div key="check" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      ) : (
                        <motion.div key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          {Icon && (<Icon className={`w-5 h-5 ${isActive ? showError ? "text-red-500" : "text-emerald-500" : "text-gray-300"}`} />)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div className={`flex-1 pt-1 transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
                    <div className="flex justify-between items-center">
                      <h3 className={`text-base font-semibold ${isActive ? showError ? "text-red-600" : "text-slate-900" : "text-slate-700"}`}>{step.title}</h3>
                      <AnimatePresence>
                        {isActive && !error && step.id !== 5 && (
                          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-[10px] font-bold">PROCESSING</span>
                          </motion.div>
                        )}
                        {isActive && step.id === 5 && (
                          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500 text-white rounded-full">SUCCESS</motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.div layout>
                      <p className="text-sm text-slate-500 leading-snug mt-0.5">{showError ? (<span className="text-red-500 font-medium">{error}</span>) : (step.subtitle)}</p>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}