// src/app/test/page.tsx

import { Navbar } from "@/core/ui/Navbar";
import { hybridDb } from "@/core/db/hybrid";
import { isLocalDbAvailable } from "@/core/db/clients";
import { createTestChainAction } from "./actions";
import Link from "next/link";

export default async function TestPage() {
  const isLocal = isLocalDbAvailable();
  
  // Haal ter controle de laatst aangemaakte objecten op
  // (We halen leeg array op voor getObjectsByIds om de hybride query te testen indien nodig)
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <header className="border-b pb-4">
          <h1 className="text-2xl font-bold text-amber-600">🧪 Ontwikkel- & Testmodule</h1>
          <p className="text-slate-600 text-sm">
            Genereer snel testdata om de graph traversal en hybride opslag te valideren.
          </p>
        </header>

        {/* Status kaart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800">Actieve Opslagstatus</h2>
          <p className="text-sm text-slate-600">
            Huidige modus:{" "}
            <strong className={isLocal ? "text-emerald-600" : "text-blue-600"}>
              {isLocal ? "Hybride (Lokaal + Turso)" : "Publiek-Only (Turso)"}
            </strong>
          </p>

          <form action={async () => {
            "use server";
            const res = await createTestChainAction();
          }}>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>⚡ Generereer Test-Keten (A ➔ B ➔ C)</span>
            </button>
          </form>
        </div>

        {/* Instructie voor Beheer */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl space-y-2">
          <h3 className="font-bold text-blue-900 text-sm">Hoe nu te testen?</h3>
          <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1 leading-relaxed">
            <li>Klik op de oranje knop hierboven om een 3-staps keten aan te maken.</li>
            <li>
              Ga naar{" "}
              <Link href="/beheer" className="underline font-bold">
                Module 1 (Beheer)
              </Link>{" "}
              en kies het aangemaakte Startobject A.
            </li>
            <li>
              Op je <strong>PC</strong> zie je de complete keten: A ➔ B (Vertrouwelijk) ➔ C.
            </li>
            <li>
              Op je <strong>Smartphone</strong> (Vercel) stopt de keten bij A of B als vertrouwelijk niet beschikbaar is!
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}