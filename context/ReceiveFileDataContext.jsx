"use client";

import { createContext, useContext, useReducer } from "react";

const ReceiveFileDataContext = createContext(null);

const ACTIONS = {
  SET_FILES: "SET_FILES",
  ADD_FILE: "ADD_FILE",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  CLEAR_FILES: "CLEAR_FILES",
};

const initialState = {
  files: [],
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
    case ACTIONS.CLEAR_FILES:
      return { ...state, files: [] };
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

  const clearFiles = () => {
    dispatch({ type: ACTIONS.CLEAR_FILES });
  };

  return (
    <ReceiveFileDataContext.Provider
      value={{
        files: state.files,
        setFiles,
        addFile,
        updateProgress,
        clearFiles,
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
