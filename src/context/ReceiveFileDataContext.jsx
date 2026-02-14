"use client";

import { createContext, useContext, useReducer } from "react";

const ReceiveFileDataContext = createContext(null);

const ACTIONS = {
  SET_FILES: "SET_FILES",
  ADD_FILE: "ADD_FILE",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  UPDATE_FILE: "UPDATE_FILE",
  CLEAR_FILES: "CLEAR_FILES",
  SET_SPEED: "SET_SPEED",
};

const initialState = {
  files: [],
  downloadSpeed: 0,
};

function receiveReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_FILES:
      return { ...state, files: action.payload || [] };
    case ACTIONS.ADD_FILE:
      return { ...state, files: [...state.files, action.payload] };
    case ACTIONS.UPDATE_PROGRESS: {
      const { index, progress } = action.payload;
      const updated = state.files.map((f, i) =>
        i === index ? { ...f, progress } : f
      );
      return { ...state, files: updated };
    }
    case ACTIONS.UPDATE_FILE: {
      const { index, updates } = action.payload;
      const updated = state.files.map((f, i) =>
        i === index ? { ...f, ...updates } : f
      );
      return { ...state, files: updated };
    }
    case ACTIONS.CLEAR_FILES:
      return { ...state, files: [] };
    case ACTIONS.SET_SPEED:
      return { ...state, downloadSpeed: action.payload };
    default:
      return state;
  }
}

export function ReceiveFileDataProvider({ children }) {
  const [state, dispatch] = useReducer(receiveReducer, initialState);

  const setFiles = (filesArray) => {
    dispatch({ type: ACTIONS.SET_FILES, payload: filesArray });
  };

  const addFile = (fileObj) => {
    dispatch({ type: ACTIONS.ADD_FILE, payload: fileObj });
  };

  const updateProgress = (index, progress) => {
    dispatch({
      type: ACTIONS.UPDATE_PROGRESS,
      payload: { index, progress },
    });
  };

  const updateFile = (index, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_FILE,
      payload: { index, updates },
    });
  };

  const clearFiles = () => {
    dispatch({ type: ACTIONS.CLEAR_FILES });
  };

  const setDownloadSpeed = (speed) => {
    dispatch({ type: ACTIONS.SET_SPEED, payload: speed });
  };

  return (
    <ReceiveFileDataContext.Provider
      value={{
        files: state.files,
        downloadSpeed: state.downloadSpeed,
        setFiles,
        addFile,
        updateProgress,
        updateFile,
        clearFiles,
        setDownloadSpeed,
      }}
    >
      {children}
    </ReceiveFileDataContext.Provider>
  );
}

export function useReceiveFileData() {
  const ctx = useContext(ReceiveFileDataContext);
  if (!ctx) {
    throw new Error(
      "useReceiveFileData must be used inside ReceiveFileDataProvider"
    );
  }
  return ctx;
}
