"use client";

import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-black/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" aria-label="Home" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="App Logo"
                width={100}
                height={100}
                className="w-12 h-12 rounded-md ring-2 ring-zinc-300 dark:ring-white transition-shadow bg-white"
              />
            </Link>
            <span className="ml-2 font-semibold text-sm sm:text-base truncate max-w-[60vw] sm:max-w-none" title="Automated Answer Sheet Evaluation System"> <span className="hidden sm:inline">Automated Answer Sheet Evaluation System</span><span className="sm:hidden">AASES</span> </span>
          </div>

          <div className="flex-1" />

          <RightNav />
        </div>
      </div>
    </header>
  );
}

function RightNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="flex items-center gap-1">
      <Link href="/" className="text-sm font-medium px-3 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
        Home
      </Link>
      <Link href="/about" className="text-sm font-medium px-3 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
        About
      </Link>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-medium px-3 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          Settings ▾
        </button>
        {open && (
          <div role="menu" className="absolute right-0 mt-2 w-56 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg p-2">
            <div className="px-2 py-1 text-xs text-muted-foreground">Appearance</div>
            <div className="px-2 py-1">
              <ModeToggle />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
