"use client";
import { useRef } from "react";

export default function FileInput() {
  const inputRef = useRef(null);

  const pick = (e) => {
    const files = Array.from(e.target.files || []);
    console.log(files);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">
        Select files you want to share
      </p>

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full py-2 px-4 border rounded-lg text-sm font-medium active:scale-95"
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
