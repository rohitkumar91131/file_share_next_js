"use client";
import Image from "next/image";
import Link from "next/link";
import { LogIn, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" width={32} height={32 } alt="logo" />
        <h1 className="text-xl font-semibold hidden md:block">File Share</h1>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/login" className="flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          <span className="hidden md:block">Login</span>
        </Link>

        <Link href="/dashboard" className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" />
          <span className="hidden md:block">Dashboard</span>
        </Link>
      </div>
    </nav>
  );
}
