"use client";

import { createContext, useContext, useReducer, useCallback } from "react";

const ChatContext = createContext(null);

const ACTIONS = {
  ADD_MESSAGE: "ADD_MESSAGE",
  CLEAR_MESSAGES: "CLEAR_MESSAGES",
};

function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };
    case ACTIONS.CLEAR_MESSAGES:
      return { ...state, messages: [] };
    default:
      return state;
  }
}

const initialState = { messages: [] };

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const addMessage = useCallback((msg) => {
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: msg });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_MESSAGES });
  }, []);

  return (
    <ChatContext.Provider value={{ messages: state.messages, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatStore must be used inside ChatProvider");
  return ctx;
}
