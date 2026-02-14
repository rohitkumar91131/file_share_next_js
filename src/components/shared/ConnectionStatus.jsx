"use client";
import { useWebRTCStore } from '@/context/webrtc/WebRTCContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const STATES = {
    connecting: { label: 'Connecting...', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Loader2, animate: true },
    connected: { label: 'Connected', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, animate: false },
    disconnected: { label: 'Disconnected', color: 'bg-gray-100 text-gray-600 border-gray-300', icon: XCircle, animate: false },
    failed: { label: 'Connection Failed', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, animate: false },
};

export default function ConnectionStatus() {
    const { connectionState } = useWebRTCStore();

    if (!connectionState) return null;

    const state = STATES[connectionState] || STATES.disconnected;
    const Icon = state.icon;

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${state.color}`}>
            <Icon className={`w-4 h-4 ${state.animate ? 'animate-spin' : ''}`} />
            <span>{state.label}</span>
        </div>
    );
}
