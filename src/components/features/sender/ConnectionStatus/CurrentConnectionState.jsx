"use client";
import { useWebRTCStore } from '@/context/webrtc/WebRTCContext';
import React, { useEffect } from 'react';
import { Wifi, WifiOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const CONNECTION_STATES = {
  'new': { label: 'Initializing', icon: Loader2, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', animate: true },
  'connecting': { label: 'Connecting', icon: Loader2, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', animate: true },
  'waiting for offer': { label: 'Waiting for Peer', icon: Loader2, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', animate: true },
  'answer sent': { label: 'Negotiating', icon: Loader2, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', animate: true },
  'connected': { label: 'Connected', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', animate: false },
  'disconnected': { label: 'Disconnected', icon: WifiOff, color: 'text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800', animate: false },
  'failed': { label: 'Connection Failed', icon: AlertCircle, color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', animate: false },
  'closed': { label: 'Connection Closed', icon: WifiOff, color: 'text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800', animate: false },
};

export default function CurrentConnectionState() {
  const { connectionState } = useWebRTCStore();

  // Alert on connection state changes for debugging
  useEffect(() => {
    if (connectionState) {
      console.log('🔌 [SENDER] Connection State Changed:', connectionState);

      // Show toast for important state changes
      if (connectionState === 'connected') {
        toast.success('Peer connection established!');
      } else if (connectionState === 'disconnected') {
        toast.warning('Connection disconnected!');
      } else if (connectionState === 'failed') {
        toast.error('Connection failed!');
      }
    }
  }, [connectionState]);

  // Don't show badge if no connection state or if it's still initializing without a session
  if (!connectionState || connectionState === 'new') return null;

  const state = CONNECTION_STATES[connectionState] || CONNECTION_STATES['disconnected'];
  const Icon = state.icon;

  return (
    <div className="flex justify-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${state.color}`}>
        <Icon className={`w-4 h-4 ${state.animate ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{state.label}</span>
      </div>
    </div>
  );
}
