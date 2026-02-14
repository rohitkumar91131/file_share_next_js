"use client";
import { LoaderIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <LoaderIcon className="w-10 h-10 animate-spin" />
    </div>
  );
}
