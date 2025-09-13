"use client";

import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";
import Image from "next/image";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-black/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Umar" width={100} height={100} className="w-12 h-20" />
              <span className="sr-only">Home</span>
          </div>

          <nav className="flex-1 flex items-center justify-center">
            <Link href="/" className="text-sm font-medium px-3 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
              Home
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
