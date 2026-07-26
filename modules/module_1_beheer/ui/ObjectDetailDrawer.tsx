// src/modules/module_1_beheer/ui/ObjectDetailDrawer.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ObjectItem } from "@/core/ui/ObjectSelector";
import { ObjectSelector } from "@/core/ui/ObjectSelector";
import { RelationTypeSelector, RelationTypeItem } from "@/core/ui/RelationTypeSelector";
import { createRelationAction } from "../actions/createRelation";
import { getRelationTypesAction, createRelationTypeAction } from "../actions/relationTypes";

interface ObjectDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  object: (ObjectItem & { isConfidential?: boolean }) | null;
  allObjects: ObjectItem[];
  // Reeds gekoppelde ID's om uitsluiting toe te passen
  existingRelatedIds?: string[];
  onRelationCreated?: () => void;
}

export function ObjectDetailDrawer({
  isOpen,
  onClose,
  object,
  allObjects,
  existingRelatedIds = [],
  onRelationCreated,
}: ObjectDetailDrawerProps) {
  const [mobileSnap, setMobileSnap] = useState<"peek" | "full">("peek");
  const [relationTypes, setRelationTypes] = useState<RelationTypeItem[]>([]);

  // Formulieren state
  const [incomingSourceId, setIncomingSourceId] = useState("");
  const [incomingTypeId, setIncomingTypeId] = useState("");

  const [outgoingTargetId, setOutgoingTargetId] = useState("");
  const [outgoingTypeId, setOutgoingTypeId] = useState("");

  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [loadingOutgoing, setLoadingOutgoing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Laad beschikbare relatietypes bij openen
  useEffect(() => {
    if (isOpen) {
      setMobileSnap("peek");
      setErrorMsg(null);
      getRelationTypesAction().then((res) => {
        if (res.success) setRelationTypes(res.types || []);
      });
    }
  }, [isOpen]);

  // FILTER: Sluit eigen object én reeds gekoppelde objecten uit
  const availableObjects = useMemo(() => {
    if (!object) return [];
    const excludeSet = new Set([object.id, ...existingRelatedIds]);
    return allObjects.filter((o) => !excludeSet.has(o.id));
  }, [allObjects, object, existingRelatedIds]);

  const handleCreateType = async (label: string) => {
    const res = await createRelationTypeAction(label);
    if (res.success && res.relationType) {
      setRelationTypes((prev) => [...prev, res.relationType!]);
    }
  };

  // 1. Ingaande relatie opslaan (Source -> Geselecteerd Object)
  const handleAddIncoming = async () => {
    if (!object || !incomingSourceId) return;
    setLoadingIncoming(true);
    setErrorMsg(null);

    const res = await createRelationAction({
      sourceId: incomingSourceId,
      targetId: object.id,
      relationTypeId: incomingTypeId || undefined,
      isConfidential: object.isConfidential,
    });

    setLoadingIncoming(false);
    if (res.success) {
      setIncomingSourceId("");
      setIncomingTypeId("");
      if (onRelationCreated) onRelationCreated();
    } else {
      setErrorMsg(res.error || "Mislukt");
    }
  };

  // 2. Uitgaande relatie opslaan (Geselecteerd Object -> Target)
  const handleAddOutgoing = async () => {
    if (!object || !outgoingTargetId) return;
    setLoadingOutgoing(true);
    setErrorMsg(null);

    const res = await createRelationAction({
      sourceId: object.id,
      targetId: outgoingTargetId,
      relationTypeId: outgoingTypeId || undefined,
      isConfidential: object.isConfidential,
    });

    setLoadingOutgoing(false);
    if (res.success) {
      setOutgoingTargetId("");
      setOutgoingTypeId("");
      if (onRelationCreated) onRelationCreated();
    } else {
      setErrorMsg(res.error || "Mislukt");
    }
  };

  if (!object) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px]"
            onClick={onClose}
          />

          <div className="fixed inset-0 pointer-events-none flex flex-col justify-end sm:justify-start">
            <motion.div
              initial={{ y: "100%", x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  if (mobileSnap === "full") setMobileSnap("peek");
                  else onClose();
                } else if (info.offset.y < -80 || info.velocity.y < -500) {
                  setMobileSnap("full");
                }
              }}
              className={`pointer-events-auto w-full bg-white shadow-2xl border-t sm:border-t-0 sm:border-l border-slate-200 flex flex-col justify-between transition-all duration-300 ease-out
                rounded-t-3xl sm:rounded-none sm:ml-auto sm:w-screen sm:max-w-md sm:h-full
                ${mobileSnap === "peek" ? "h-[50vh] sm:h-full" : "h-[90vh] sm:h-full"}
              `}
            >
              {/* MOBIELE DRAG HANDLE */}
              <div className="w-full pt-3 pb-2 flex flex-col items-center justify-center sm:hidden cursor-grab active:cursor-grabbing bg-slate-50 rounded-t-3xl border-b border-slate-100">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1" />
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                  <span>Sleep omhoog/omlaag</span>
                  <span>•</span>
                  <button
                    onClick={() => setMobileSnap(mobileSnap === "peek" ? "full" : "peek")}
                    className="text-blue-600 font-semibold underline"
                  >
                    {mobileSnap === "peek" ? "Vergroot" : "Verklein"}
                  </button>
                </div>
              </div>

              {/* HEADER */}
              <div className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-50 border-b flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full uppercase tracking-wider">
                  Beheer & Relaties
                </span>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 text-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* INHOUD */}
              <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {errorMsg}
                  </div>
                )}

                {/* 1. SECTIE BOVEN: INGAANDE RELATIE (Bovenliggend -> Target) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>▲</span> Ingaande Relatie Leggen
                    </h3>
                    <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      Bovenliggend
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Koppel een bestaand object dat <strong>wijst naar</strong> {object.label}.
                  </p>

                  <ObjectSelector
                    label="Kies bovenliggend object (Source):"
                    allObjects={availableObjects}
                    selectedObjectId={incomingSourceId}
                    onSelect={(id) => setIncomingSourceId(id)}
                  />

                  <RelationTypeSelector
                    relationTypes={relationTypes}
                    selectedTypeId={incomingTypeId}
                    onSelect={(id) => setIncomingTypeId(id)}
                    onCreateNew={handleCreateType}
                  />

                  <button
                    onClick={handleAddIncoming}
                    disabled={!incomingSourceId || loadingIncoming}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                  >
                    {loadingIncoming ? "Koppelen..." : "▲ Ingaande relatie opslaan"}
                  </button>
                </div>

                {/* 2. HET HUIDIGE OBJECT IN HET MIDDEN */}
                <div className="p-3 bg-blue-50 border-2 border-blue-400 rounded-xl text-center">
                  <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                    Geselecteerd Object
                  </span>
                  <h4 className="text-lg font-extrabold text-blue-950">{object.label}</h4>
                </div>

                {/* 3. SECTIE ONDER: UITGAANDE RELATIE (Source -> Onderliggend) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>▼</span> Uitgaande Relatie Leggen
                    </h3>
                    <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      Onderliggend
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Koppel een bestaand object waar {object.label} <strong>naar wijst</strong>.
                  </p>

                  <ObjectSelector
                    label="Kies onderliggend object (Target):"
                    allObjects={availableObjects}
                    selectedObjectId={outgoingTargetId}
                    onSelect={(id) => setOutgoingTargetId(id)}
                  />

                  <RelationTypeSelector
                    relationTypes={relationTypes}
                    selectedTypeId={outgoingTypeId}
                    onSelect={(id) => setOutgoingTypeId(id)}
                    onCreateNew={handleCreateType}
                  />

                  <button
                    onClick={handleAddOutgoing}
                    disabled={!outgoingTargetId || loadingOutgoing}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                  >
                    {loadingOutgoing ? "Koppelen..." : "▼ Uitgaande relatie opslaan"}
                  </button>
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-4 bg-slate-50 border-t flex justify-end">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}