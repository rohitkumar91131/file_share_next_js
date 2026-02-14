"use client";

import { ReceivingStatusProvider } from "@/context/ReceivingSideStatusContext";
import { WebRTCProvider } from "@/context/webrtc/WebRTCContext";
import { SenderStatusProvider } from "@/context/SenderSideStatusContext";
import { SendFileDataProvider } from "@/context/SendFileDataContext";
import { ReceiveFileDataProvider } from "@/context/ReceiveFileDataContext";
import { PairingLinkProvider } from "@/context/PairingLinkContext";

import { ThemeProvider } from "@/components/theme-provider";

export function AppProviders({ children }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <WebRTCProvider>
                <SenderStatusProvider>
                    <PairingLinkProvider>
                        <ReceivingStatusProvider>
                            <SendFileDataProvider>
                                <ReceiveFileDataProvider>
                                    {children}
                                </ReceiveFileDataProvider>
                            </SendFileDataProvider>
                        </ReceivingStatusProvider>
                    </PairingLinkProvider>
                </SenderStatusProvider>
            </WebRTCProvider>
        </ThemeProvider>
    );
}
