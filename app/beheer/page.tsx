// src/app/beheer/page.tsx

import Link from "next/link";
import { Navbar } from "@/core/ui/Navbar";
import { hybridDb } from "@/core/db/hybrid";

export default async function BeheerIndexPage() {
  // Haal alle objecten op uit Turso + SQLite
  const allObjects = await hybridDb.getAllObjects();

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

          {allObjects.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nog geen objecten aanwezig. Maak er eerst een paar aan in de testmodule.
            </p>
          ) : (
            <div className="space-y-2">
              {allObjects.map((obj) => (
                <Link
                  key={obj.id}
                  href={`/beheer/${obj.id}`}
                  className="p-3 border rounded-lg flex items-center justify-between hover:bg-slate-50 hover:border-blue-400 transition block"
                >
                  <div>
                    <p className="font-medium text-slate-800">{obj.label}</p>
                    <p className="text-xs text-slate-400 font-mono">{obj.id}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      obj.isConfidential
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {obj.isConfidential ? "🔒 Vertrouwelijk (Lokaal)" : "🌐 Publiek (Turso)"}
                  </span>
                </Link>
              ))}
            </div>
          )}

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