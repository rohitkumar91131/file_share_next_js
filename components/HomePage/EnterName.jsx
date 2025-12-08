"use client";
import { useState } from "react";

export default function EnterName({ onSubmit }) {
  const [name, setName] = useState("");

  return (
    <div className="w-full max-w-sm mx-auto mt-14 p-6 border rounded-xl flex flex-col gap-4">
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />

      <button
        onClick={() => onSubmit(name)}
        className="w-full py-2 rounded-lg border bg-black text-white active:scale-95"
      >
        Submit
      </button>
    </div>
  );
}
