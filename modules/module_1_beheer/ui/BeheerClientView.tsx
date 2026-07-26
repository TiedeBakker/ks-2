// src/modules/module_1_beheer/ui/BeheerClientView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ObjectSelector, ObjectItem } from "@/core/ui/ObjectSelector";
import { CreateObjectModal } from "./CreateObjectModal";
import { ObjectDetailDrawer } from "./ObjectDetailDrawer";

interface BeheerClientViewProps {
    allObjects: ObjectItem[];
    selectedObjectId?: string;
    graphData: {
        currentObject: ObjectItem & { isConfidential?: boolean };
        incomingChain: Array<{
            object: ObjectItem & { isConfidential?: boolean };
            isBranch: boolean;
            branchCount: number;
            isTerminal: boolean;
        }>;
        outgoingChain: Array<{
            object: ObjectItem & { isConfidential?: boolean };
            isBranch: boolean;
            branchCount: number;
            isTerminal: boolean;
        }>;
    } | null;
}

export function BeheerClientView({
    allObjects,
    selectedObjectId,
    graphData,
}: BeheerClientViewProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleSelectObject = (id: string) => {
        router.push(`/beheer?id=${id}`);
    };

    const handleObjectCreated = (newObjectId: string) => {
        // Na aanmaken direct navigeren naar het nieuwe object
        router.push(`/beheer?id=${newObjectId}`);
    };

    return (
        <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
            {/* HEADER EN SELECTIE-BOUWSTEEN */}
            <header className="border-b pb-4 space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">Module 1: Beheer</h1>

                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <ObjectSelector
                        label="Start-object:"
                        allObjects={allObjects}
                        selectedObjectId={selectedObjectId}
                        onSelect={handleSelectObject}
                        onNewClick={() => setIsModalOpen(true)}
                    />
                </div>
            </header>

            {/* WEERGAVE OBJECT-KETEN */}
            {!graphData ? (
                <div className="bg-white p-8 rounded-xl border text-center text-slate-500 shadow-sm">
                    Selecteer hierboven een start-object om de keten te bekijken.
                </div>
            ) : (
                <div className="space-y-6">
                    {/* SECTION 1: INGAANDE OBJECTEN (SOURCE -> TARGET) */}
                    <section className="bg-slate-50 p-4 rounded-lg border">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Ingaande Lijn (Bovenliggend)
                        </h2>
                        {graphData.incomingChain.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Geen ingaande relaties (Startpunt)</p>
                        ) : (
                            <div className="flex flex-col items-center space-y-2">
                                {graphData.incomingChain.map((node, index) => (
                                    <div key={node.object.id} className="flex flex-col items-center w-full">
                                        <button
                                            onClick={() => handleSelectObject(node.object.id)}
                                            className="w-full max-w-md p-3 bg-white rounded border hover:border-blue-500 transition shadow-sm flex justify-between items-center text-left"
                                        >
                                            <span className="font-medium text-gray-800">{node.object.label}</span>
                                            {node.object.isConfidential && (
                                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                    Vertrouwelijk
                                                </span>
                                            )}
                                        </button>

                                        {index === graphData.incomingChain.length - 1 && (
                                            <div className="my-2 text-xs font-bold text-gray-500">
                                                {node.isBranch && `▲ Splitsing (${node.branchCount} takken)`}
                                                {node.isTerminal && "▲ Eindpunt"}
                                            </div>
                                        )}
                                        <span className="text-gray-400">↑</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* SECTION 2: GEKOZEN STARTOBJECT (OPTIMALISEREN VOOR DESKTOP & MOBIEL) */}
                    <section
                        onDoubleClick={() => setIsDrawerOpen(true)}
                        className="bg-blue-50 border-2 border-blue-500 p-5 sm:p-6 rounded-2xl shadow-md text-center space-y-4 relative group"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                                Actief Object
                            </span>
                            {/* Subtiele tip per apparaat */}
                            <span className="text-xs text-blue-600/80 hidden sm:inline">
                                (Dubbelklik voor beheer)
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 break-words">
                                {graphData.currentObject.label}
                            </h2>

                            {/* Duidelijke actieknop die op mobiel extra opvalt en makkelijk aan te tikken is */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDrawerOpen(true);
                                }}
                                className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 text-xs font-semibold bg-white text-blue-700 border border-blue-300 rounded-xl hover:bg-blue-100/50 transition shadow-sm flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0"
                                title="Beheervenster openen"
                            >
                                <span>✏️</span>
                                <span>Beheren & Relaties</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 pt-3 border-t border-blue-200/80">
                            <span>
                                ID: <code className="bg-blue-100/80 px-1.5 py-0.5 rounded font-mono">{graphData.currentObject.id}</code>
                            </span>
                            <span>
                                Status:{" "}
                                <strong
                                    className={
                                        graphData.currentObject.isConfidential
                                            ? "text-amber-700"
                                            : "text-green-700"
                                    }
                                >
                                    {graphData.currentObject.isConfidential
                                        ? "Vertrouwelijk (Lokaal)"
                                        : "Publiek (Turso)"}
                                </strong>
                            </span>
                        </div>
                    </section>
                    {/* SECTION 3: UITGAANDE OBJECTEN (SOURCE -> TARGET) */}
                    <section className="bg-slate-50 p-4 rounded-lg border">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Uitgaande Lijn (Onderliggend)
                        </h2>
                        {graphData.outgoingChain.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Geen uitgaande relaties (Eindpunt)</p>
                        ) : (
                            <div className="flex flex-col items-center space-y-2">
                                {graphData.outgoingChain.map((node, index) => (
                                    <div key={node.object.id} className="flex flex-col items-center w-full">
                                        <span className="text-gray-400 mb-2">↓</span>
                                        <button
                                            onClick={() => handleSelectObject(node.object.id)}
                                            className="w-full max-w-md p-3 bg-white rounded border hover:border-blue-500 transition shadow-sm flex justify-between items-center text-left"
                                        >
                                            <span className="font-medium text-gray-800">{node.object.label}</span>
                                            {node.object.isConfidential && (
                                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                    Vertrouwelijk
                                                </span>
                                            )}
                                        </button>

                                        {index === graphData.outgoingChain.length - 1 && (
                                            <div className="mt-2 text-xs font-bold text-gray-500">
                                                {node.isBranch && `▼ Splitsing (${node.branchCount} takken)`}
                                                {node.isTerminal && "▼ Eindpunt"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* MODAL POP-UP (Nieuw Object) */}
            <CreateObjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={handleObjectCreated}
            />

            {/* SLIDE-OVER DRAWER (Raadpleeg / Beheer venster) */}
            <ObjectDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                object={graphData?.currentObject || null}
            />
        </main>
    );
}