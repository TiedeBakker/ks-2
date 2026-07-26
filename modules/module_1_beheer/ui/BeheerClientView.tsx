// src/modules/module_1_beheer/ui/BeheerClientView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ObjectSelector, ObjectItem } from "@/core/ui/ObjectSelector";
import { CreateObjectModal } from "./CreateObjectModal";
import { ObjectDetailDrawer, OutgoingRelationItem } from "./ObjectDetailDrawer";

export interface ChainNode {
    object: ObjectItem & { isConfidential?: boolean };
    branchCount: number;
    isTerminal: boolean;
}

export interface ChainStep {
    isBranch: boolean;
    nodes: ChainNode[];
}

interface BeheerClientViewProps {
    allObjects: ObjectItem[];
    selectedObjectId?: string;
    graphData: {
        currentObject: ObjectItem & { isConfidential?: boolean };
        incomingChain: ChainStep[];
        outgoingChain: ChainStep[];
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
        router.push(`/beheer?id=${newObjectId}`);
    };

    // --- TRANSFORMEER UITGAANDE KETEN NAAR OUTGOINGRELATIONITEMS ---
    // We pakken de eerste stap uit de outgoingChain (de directe uitgaande relaties)
    // Transformeer de directe kinderen naar relaties met de ECHTE database-velden
    const directOutgoingNodes = graphData?.outgoingChain[0]?.nodes || [];

    const outgoingRelationsForDrawer: OutgoingRelationItem[] = directOutgoingNodes.map((node) => {
        // Haal eventuele relationele data op die vanuit de backend mee is gestuurd op het node-object
        const nodeObj = node.object as any;

        return {
            // Gebruik het echte DB relationValueId (of ID van de relatie-entiteit)
            relationValueId: nodeObj.relationValueId || nodeObj.relationId || node.object.id,
            relationId: nodeObj.relationType || nodeObj.relationId || "heeft_onderdeel",
            targetObject: node.object,
            validFrom: nodeObj.validFrom || null,
            validTo: nodeObj.validTo || null,
        };
    });

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
                    {/* INGAANDE OBJECTEN */}
                    <section className="bg-slate-50 p-4 rounded-lg border">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Ingaande Lijn (Bovenliggend)
                        </h2>
                        {graphData.incomingChain.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">
                                Geen ingaande relaties (Startpunt)
                            </p>
                        ) : (
                            <div className="flex flex-col items-center space-y-4 w-full">
                                {graphData.incomingChain.map((step, stepIndex) => (
                                    <div
                                        key={`in-step-${stepIndex}`}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <div
                                            className={`flex w-full ${step.isBranch
                                                ? "flex-row flex-wrap justify-center gap-4"
                                                : "flex-col items-center"
                                                }`}
                                        >
                                            {(step.nodes || []).map((node) => (
                                                <div
                                                    key={node.object.id}
                                                    className="flex flex-col items-center flex-1 min-w-[200px] max-w-md"
                                                >
                                                    {stepIndex === 0 && (
                                                        <div className="mb-2 text-xs font-bold text-gray-500 text-center">
                                                            {node.branchCount > 0 &&
                                                                `▲ Bovenliggende takken (${node.branchCount})`}
                                                            {node.isTerminal && "▲ Beginpunt"}
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => handleSelectObject(node.object.id)}
                                                        className="w-full p-3 bg-white rounded border hover:border-blue-500 transition shadow-sm flex justify-between items-center text-left"
                                                    >
                                                        <span className="font-medium text-gray-800">
                                                            {node.object.label}
                                                        </span>
                                                        {node.object.isConfidential && (
                                                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                                Vertrouwelijk
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-gray-400 mt-4">↑</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* GEKOZEN STARTOBJECT */}
                    <section
                        onDoubleClick={() => setIsDrawerOpen(true)}
                        className="bg-blue-50 border-2 border-blue-500 p-5 sm:p-6 rounded-2xl shadow-md text-center space-y-4 relative group cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                                Actief Object
                            </span>
                            <span className="text-xs text-blue-600/80 hidden sm:inline">
                                (Dubbelklik of klik knop voor beheer)
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 break-words">
                                {graphData.currentObject.label}
                            </h2>

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
                                ID:{" "}
                                <code className="bg-blue-100/80 px-1.5 py-0.5 rounded font-mono">
                                    {graphData.currentObject.id}
                                </code>
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

                    {/* UITGAANDE OBJECTEN */}
                    <section className="bg-slate-50 p-4 rounded-lg border">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Uitgaande Lijn (Onderliggend)
                        </h2>
                        {graphData.outgoingChain.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">
                                Geen uitgaande relaties (Eindpunt)
                            </p>
                        ) : (
                            <div className="flex flex-col items-center space-y-4 w-full">
                                {graphData.outgoingChain.map((step, stepIndex) => (
                                    <div
                                        key={`out-step-${stepIndex}`}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <span className="text-gray-400 mb-4">↓</span>

                                        <div
                                            className={`flex w-full ${step.isBranch
                                                ? "flex-row flex-wrap justify-center gap-4"
                                                : "flex-col items-center"
                                                }`}
                                        >
                                            {(step.nodes || []).map((node) => (
                                                <div
                                                    key={node.object.id}
                                                    className="flex flex-col items-center flex-1 min-w-[200px] max-w-md"
                                                >
                                                    <button
                                                        onClick={() => handleSelectObject(node.object.id)}
                                                        className="w-full p-3 bg-white rounded border hover:border-blue-500 transition shadow-sm flex justify-between items-center text-left"
                                                    >
                                                        <span className="font-medium text-gray-800">
                                                            {node.object.label}
                                                        </span>
                                                        {node.object.isConfidential && (
                                                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                                Vertrouwelijk
                                                            </span>
                                                        )}
                                                    </button>

                                                    {stepIndex === graphData.outgoingChain.length - 1 && (
                                                        <div className="mt-2 text-xs font-bold text-gray-500 text-center">
                                                            {node.branchCount > 0 &&
                                                                `▼ Splitsing (${node.branchCount} takken)`}
                                                            {node.isTerminal && "▼ Eindpunt"}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* MODAL POP-UP */}
            <CreateObjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={handleObjectCreated}
            />

            {/* SLIDE-OVER DRAWER (Nu mét outgoingRelations!) */}
            <ObjectDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                object={graphData?.currentObject || null}
                allObjects={allObjects}
                onRelationCreated={() => {
                    router.refresh();
                }}
            />
        </main>
    );
}