"use client";

import { motion } from "framer-motion";
import { Activity, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useSenderStatus } from "@/context/SenderSideStatusContext";

export default function SenderStatusSummary() {
  const { currentStep, steps, error, setIsOpen } = useSenderStatus();
  
  const activeStepObj = steps.find((s) => s.id === currentStep) || steps[0];
  const isComplete = currentStep === 5;

  return (
    <motion.button
      layoutId="status-card-container" // MAGIC KEY matches the big component
      onClick={() => setIsOpen(true)}
      className={`relative flex items-center gap-4 px-6 py-4 rounded-full shadow-xl transition-all
        ${error ? 'bg-red-50' : 'bg-white'} 
        border border-gray-100 hover:shadow-2xl hover:scale-105 active:scale-95 group`}
      style={{ minWidth: "320px" }}
    >
      {/* Icon Circle */}
      <motion.div 
        layoutId="icon-circle"
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm
          ${isComplete ? 'bg-emerald-500 text-white' : error ? 'bg-red-500 text-white' : 'bg-slate-900 text-emerald-400'}`}
      >
        {error ? <AlertCircle size={20} /> : isComplete ? <CheckCircle2 size={20} /> : <Activity size={20} className="animate-pulse" />}
      </motion.div>

      {/* Text Info */}
      <div className="flex-1 text-left">
        <motion.p layoutId="status-label" className="text-xs font-bold uppercase text-slate-400 mb-0.5">
          Current Status
        </motion.p>
        <motion.h3 layoutId="status-title" className={`text-sm font-bold ${error ? 'text-red-600' : 'text-slate-800'}`}>
          {error ? "Connection Error" : activeStepObj.title}
        </motion.h3>
      </div>

      {/* Expand Icon */}
      <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
        <ChevronRight size={20} />
      </div>
    </motion.button>
  );
}