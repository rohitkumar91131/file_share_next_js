"use client";

import { useRef } from "react";
import { useSendFileData } from "@/context/SendFileDataContext";

export default function FileInput() {
  const inputRef = useRef(null);
  const { addFiles } = useSendFileData();

  const pick = (e) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList);
      addFiles(filesArray);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">
        Select files you want to share
      </p>

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full py-2 px-4 border rounded-lg text-sm font-medium active:scale-95 bg-white hover:bg-gray-50 transition-colors"
      >
        Select Files
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={pick}
      />
    </div>
  );
}
