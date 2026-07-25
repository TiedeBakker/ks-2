// src/app/beheer/page.tsx

import Link from "next/link";
import { Navbar } from "@/core/ui/Navbar";
import { hybridDb } from "@/core/db/hybrid";

export default async function BeheerIndexPage() {
  // Voor nu halen we ter demonstratie een lijstje met objecten op (bijv. de eersten)
  // In latere stappen maken we hier een mooie zoekbalk van.
  const sampleObjects = await hybridDb.getObjectsByIds([]); // of een overzicht-query

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 space-y-6">
        <header className="border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-900">Module 1: Kennisbeheer</h1>
          <p className="text-sm text-slate-500">
            Kies een vertrekpunt-object om de ingaande en uitgaande kennislijnen te verkennen.
          </p>
        </header>

        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-800">Selecteer een Startobject</h2>
          <p className="text-sm text-slate-500">
            (Zodra er data aanwezig is, verschijnen hier de meest gebruikte objecten of een zoekbalk.)
          </p>

          <div className="pt-4 border-t">
            <Link
              href="/test"
              className="inline-block px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition"
            >
              + Ga naar Testmodule om test-objecten aan te maken
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}