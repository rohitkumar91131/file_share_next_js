"use client";

import { createContext, useContext, useReducer } from "react";
import { nanoid } from "nanoid";

const SendFileDataContext = createContext(null);

const ACTIONS = {
  ADD_FILES: "ADD_FILES",
  REMOVE_FILE: "REMOVE_FILE",
  SET_ACTIVE: "SET_ACTIVE",
};

const initialState = {
  isActive: false,
  selectedFiles: [],
};

function fileReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_FILES: {
      const mapped = action.payload.map((file) => ({
        id: nanoid(),
        file,
        progress: 0,
      }));
      return {
        ...state,
        selectedFiles: [...state.selectedFiles, ...mapped],
      };
    }
    case ACTIONS.REMOVE_FILE: {
      return {
        ...state,
        selectedFiles: state.selectedFiles.filter(
          (item) => item.id !== action.payload
        ),
      };
    }
    case ACTIONS.SET_ACTIVE: {
      return {
        ...state,
        isActive: action.payload,
      };
    }
    default:
      return state;
  }
}

export function SendFileDataProvider({ children }) {
  const [state, dispatch] = useReducer(fileReducer, initialState);

  const addFiles = (filesArray) => {
    if (!filesArray || filesArray.length === 0) return;
    dispatch({ type: ACTIONS.ADD_FILES, payload: filesArray });
  };

  const removeFile = (id) => {
    dispatch({ type: ACTIONS.REMOVE_FILE, payload: id });
  };

  const setIsActive = (value) => {
    dispatch({ type: ACTIONS.SET_ACTIVE, payload: value });
  };

  return (
    <SendFileDataContext.Provider
      value={{
        selectedFiles: state.selectedFiles,
        isActive: state.isActive,
        addFiles,
        removeFile,
        setIsActive,
      }}
    >
      {children}
    </SendFileDataContext.Provider>
  );
}

export function useSendFileData() {
  const ctx = useContext(SendFileDataContext);
  if (!ctx) {
    throw new Error("useSendFileData must be used inside SendFileDataProvider");
  }
  return ctx;
}
