// src/core/ui/Navbar.tsx

import Link from "next/link";
import { isLocalDbAvailable } from "@/core/db/clients";

export function Navbar() {
  const isLocal = isLocalDbAvailable();

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Home link */}
        <Link href="/" className="font-bold text-lg tracking-wide hover:text-blue-400 transition">
          🧠 Kennissysteem <span className="text-xs text-blue-400 font-normal">v2</span>
        </Link>

        {/* Modulair Menu */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/beheer" className="hover:text-blue-400 transition">
            Module 1: Beheer
          </Link>
          <Link href="/analyse" className="text-gray-500 hover:text-gray-300 transition">
            Module 2: Analyse <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Binnenkort</span>
          </Link>
          <Link href="/test" className="text-amber-400 hover:text-amber-300 transition">
            Testmodule
          </Link>
        </nav>

        {/* Status Indicator van de Omgeving */}
        <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          <span className={`w-2 h-2 rounded-full ${isLocal ? "bg-emerald-400 animate-pulse" : "bg-blue-400"}`} />
          <span>{isLocal ? "Hybride (Lokaal + Turso)" : "Publiek (Turso Cloud)"}</span>
        </div>
      </div>
    </header>
  );
}