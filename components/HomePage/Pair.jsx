"use client";
import { useState } from "react";

export default function Pair({ device }) {
  const [choice, setChoice] = useState(null);

  return (
    <div className="w-full max-w-md mx-auto mt-14 p-6 border rounded-xl flex flex-col gap-5 items-center">
      <p className="text-center text-lg font-medium">
        The device <span className="font-bold">{device}</span> wants to pair with you.
      </p>
      <p className="text-sm text-gray-600">
        Do you want to pair?
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => setChoice("yes")}
          className="px-5 py-2 rounded-lg border bg-green-500 text-white active:scale-95"
        >
          Yes
        </button>

        <button
          onClick={() => setChoice("no")}
          className="px-5 py-2 rounded-lg border bg-red-500 text-white active:scale-95"
        >
          No
        </button>
      </div>

      {choice && (
        <p className="text-sm mt-2">
          You selected: <span className="font-bold">{choice}</span>
        </p>
      )}
    </div>
  );
}
