// src/app/beheer/[id]/page.tsx

import { getGraphForObject } from "@/modules/module_1_beheer/services/graph";
import { Navbar } from "@/core/ui/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BeheerModulePage({ params }: PageProps) {
  const { id } = await params;
  const graphData = await getGraphForObject(id);

  if (!graphData) {
    notFound();
  }

  const { currentObject, incomingChain, outgoingChain } = graphData;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <Link
            href="/beheer"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            ← Terug naar overzicht
          </Link>
        </div>

        <header className="border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-900">Module 1: Kennisbeheer</h1>
          <p className="text-sm text-slate-500">
            Actief startobject en gekoppelde kennislijnen
          </p>
        </header>

        {/* SECTION 1: INGAANDE OBJECTEN */}
        <section className="bg-slate-50 p-4 rounded-lg border">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Ingaande Lijn (Bovenliggend)
          </h2>
          {incomingChain.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Geen ingaande relaties (Startpunt)</p>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              {incomingChain.map((step, stepIndex) => (
                <div key={`inc-step-${stepIndex}`} className="flex flex-col items-center w-full space-y-2">
                  {(step.nodes || []).map((node) => (
                    <div key={node.object.id} className="flex flex-col items-center w-full">
                      <Link
                        href={`/beheer/${node.object.id}`}
                        className="w-full max-w-md p-3 bg-white rounded border hover:border-blue-500 transition shadow-sm flex justify-between items-center text-left"
                      >
                        <span className="font-medium text-gray-800">
                          {node.object.label}
                        </span>
                        {node.object.isConfidential && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            Vertrouwelijk
                          </span>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: GEKOZEN STARTOBJECT */}
        <section className="bg-blue-50 border-2 border-blue-500 p-6 rounded-xl shadow-md text-center space-y-3">
          <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
            Actief Object
          </div>
          <h2 className="text-2xl font-extrabold text-blue-950">{currentObject.label}</h2>

          <div className="flex justify-center gap-4 text-xs text-gray-600 pt-2 border-t border-blue-200">
            <span>
              ID: <code className="bg-blue-100 px-1 py-0.5 rounded">{currentObject.id}</code>
            </span>
            <span>
              Status:{" "}
              <strong className={currentObject.isConfidential ? "text-amber-700" : "text-green-700"}>
                {currentObject.isConfidential ? "Vertrouwelijk (Lokaal)" : "Publiek (Turso)"}
              </strong>
            </span>
          </div>
        </section>

        {/* SECTION 3: UITGAANDE OBJECTEN (GESORTEERD OP VOLGORDE) */}
        <section className="bg-slate-50 p-4 rounded-lg border">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Uitgaande Lijn (Onderliggend - Gesorteerd)
          </h2>
          {outgoingChain.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Geen uitgaande relaties (Eindpunt)</p>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              {outgoingChain.map((step, stepIndex) => (
                <div key={`out-step-${stepIndex}`} className="flex flex-col items-center w-full space-y-2">
                  {(step.nodes || []).map((node) => (
                    <div key={node.object.id} className="flex flex-col items-center w-full">
                      <Link
                        href={`/beheer/${node.object.id}`}
                        className="w-full max-w-md p-3 bg-white rounded border hover:border-blue-500 transition shadow-sm flex justify-between items-center text-left"
                      >
                        <span className="font-medium text-gray-800">
                          {node.object.label}
                        </span>
                        {node.object.isConfidential && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            Vertrouwelijk
                          </span>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}