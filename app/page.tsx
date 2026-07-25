// src/app/page.tsx

import Link from "next/link";
import { Navbar } from "@/core/ui/Navbar";
import { hybridDb } from "@/core/db/hybrid";
import { isLocalDbAvailable } from "@/core/db/clients";

export default async function HomePage() {
  const isLocal = isLocalDbAvailable();

  // Testdirectie: haal optioneel een paar recente objecten op ter controle
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 space-y-8">
        {/* Introductie Hero */}
        <div className="bg-white border rounded-2xl p-8 shadow-sm space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Welkom bij het Kennissysteem
          </h1>
          <p className="text-slate-600 max-w-2xl leading-relaxed">
            Beheer netwerken van kennisobjecten, relaties en parameters. 
            Data wordt transparant verdeeld over publieke opslag (Turso) en optionele lokale opslag voor vertrouwelijke data.
          </p>

          <div className="pt-2">
            <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-md ${
              isLocal ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
            }`}>
              {isLocal 
                ? "🔒 Vertrouwelijke modus actief: Verbonden met lokale SQLite DB op deze PC" 
                : "🌐 Publieke modus actief: Uitsluitend verbonden met Turso Cloud"}
            </span>
          </div>
        </div>

        {/* Module Kaarten Grid */}
        <h2 className="text-lg font-bold text-slate-800">Beschikbare Modules</h2>
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Module 1: Beheer */}
          <Link 
            href="/beheer"
            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition">
                Centrale Beheermodule
              </h3>
              <p className="text-sm text-slate-500">
                Navigeer door de kennisgrafiek. Bekijk ingaande en uitgaande relaties vanuit een gekozen object.
              </p>
            </div>
            <div className="mt-6 text-xs font-semibold text-blue-600 flex items-center gap-1">
              Openen →
            </div>
          </Link>

          {/* Module 2: Analyse (Placeholder) */}
          <div className="bg-slate-100 p-6 rounded-xl border border-dashed border-slate-300 opacity-70 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-700 text-lg">
                Analyse & Presentatie
              </h3>
              <p className="text-sm text-slate-500">
                Geavanceerde visualisaties en query's (Geoptimaliseerd voor PC).
              </p>
            </div>
            <div className="mt-6 text-xs font-semibold text-slate-400">
              In ontwikkeling
            </div>
          </div>

          {/* Testmodule */}
          <Link 
            href="/test"
            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg group-hover:bg-amber-600 group-hover:text-white transition">
                🧪
              </div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-600 transition">
                Ontwikkel / Testmodule
              </h3>
              <p className="text-sm text-slate-500">
                Voer databasetests uit, genereer test-data en verifieer de hybride werking.
              </p>
            </div>
            <div className="mt-6 text-xs font-semibold text-amber-600 flex items-center gap-1">
              Testen →
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}