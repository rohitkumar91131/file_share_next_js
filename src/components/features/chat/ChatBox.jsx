"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useWebRTCStore } from "@/context/webrtc/WebRTCContext";
import { useChatStore } from "@/context/ChatContext";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  // Keep a ref to isOpen so the message-listener closure always has the current value
  // without needing to be re-attached on every toggle.
  const isOpenRef = useRef(isOpen);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  const { webrtc, connectionState } = useWebRTCStore();
  const { messages, addMessage } = useChatStore();

  const isConnected = connectionState === "connected";

  // Listen for incoming chat messages on the data channel
  useEffect(() => {
    if (!webrtc?.dataChannel) return;
    const dc = webrtc.dataChannel;

    const handleMessage = (event) => {
      if (typeof event.data !== "string") return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type !== "chat") return;

        addMessage({
          id: crypto.randomUUID(),
          content: msg.content,
          timestamp: msg.timestamp,
          isMine: false,
        });

        // Increment unread badge when panel is closed
        if (!isOpenRef.current) {
          setUnreadCount((c) => c + 1);
        }
      } catch {
        // Ignore non-JSON or non-chat messages
      }
    };

    dc.addEventListener("message", handleMessage);
    return () => dc.removeEventListener("message", handleMessage);
  }, [webrtc?.dataChannel, addMessage]);

  // Scroll to bottom when new messages arrive while panel is open
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !isConnected) return;
    const dc = webrtc?.dataChannel;
    if (!dc || dc.readyState !== "open") return;

    const timestamp = Date.now();
    dc.send(JSON.stringify({ type: "chat", content, timestamp }));

    addMessage({
      id: crypto.randomUUID(),
      content,
      timestamp,
      isMine: true,
    });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Chat</span>
              {isConnected && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-72">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400 dark:text-slate-500 text-sm text-center">
                  {isConnected ? "Say hello! 👋" : "Connect to a peer to start chatting"}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm break-words ${
                      msg.isMine
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        msg.isMine ? "text-white/60" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? "Type a message…" : "Not connected"}
              disabled={!isConnected}
              className="flex-1 text-sm px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !input.trim()}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsOpen((o) => {
            if (!o) setUnreadCount(0); // reset badge when opening
            return !o;
          });
        }}
        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Toggle chat"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
