"use client";
import Image from "next/image";
import Link from "next/link";
import { Shield, CreditCard } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-95">
            <div className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group-hover:shadow-md transition-all duration-300">
              <Image
                src="/logo.png"
                width={32}
                height={32}
                alt="logo"
                className="w-5 h-5 md:w-6 md:h-6 object-contain"
              />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-1">
              FileShare
            </h1>
          </Link>

          {/* Trust Signals & Theme Toggle */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Trust Signals - Hidden on mobile, visible on tablet+ */}
            <div className="hidden sm:flex items-center gap-4 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                <span>No Login</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                <span>No Card</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Trust Signals - Show below navbar on small screens */}
        <div className="sm:hidden flex items-center justify-center gap-4 pb-3 text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800 pt-2 -mx-4 px-4">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>No Login Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            <span>No Card Required</span>
          </div>
        </div>
      </div>
    </nav>
  );
}