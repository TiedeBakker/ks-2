// src/modules/module_1_beheer/ui/ObjectDetailDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateObjectLabelAction, createRelationAction } from "@/core/db/actions";
import { ObjectSelector, ObjectItem } from "@/core/ui/ObjectSelector";

interface ObjectDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  object: (ObjectItem & { isConfidential?: boolean }) | null;
  allObjects: ObjectItem[];
  existingRelatedIds: string[];
  onRelationCreated: () => void;
}

export function ObjectDetailDrawer({
  isOpen,
  onClose,
  object,
  allObjects,
  existingRelatedIds,
  onRelationCreated,
}: ObjectDetailDrawerProps) {
  const router = useRouter();

  // State voor label bewerken
  const [label, setLabel] = useState("");
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isSavingLabel, setIsSavingLabel] = useState(false);

  // State voor onderliggende relatie toevoegen
  const [targetId, setTargetId] = useState("");
  const [relationType, setRelationType] = useState("heeft_onderdeel");
  const [isAddingRelation, setIsAddingRelation] = useState(false);

  useEffect(() => {
    if (object) {
      setLabel(object.label);
      setIsEditingLabel(false);
    }
  }, [object]);

  if (!isOpen || !object) return null;

  // Beschikbare objecten voor relaties (sluit huidige object en reeds gekoppelde objecten uit)
  const availableObjectsForRelation = allObjects.filter(
    (o) => o.id !== object.id && !existingRelatedIds.includes(o.id)
  );

  // Handler: Label Bewerken
  const handleSaveLabel = async () => {
    if (!label.trim() || label === object.label) {
      setIsEditingLabel(false);
      return;
    }

    setIsSavingLabel(true);
    try {
      await updateObjectLabelAction(object.id, label.trim());
      setIsEditingLabel(false);
      router.refresh();
    } catch (err) {
      console.error("Fout bij bijwerken label:", err);
      alert("Kon de naam van het object niet aanpassen.");
    } finally {
      setIsSavingLabel(false);
    }
  };

  // Handler: Onderliggend Object Koppelen (altijd source = object.id)
  const handleAddRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    setIsAddingRelation(true);

    try {
      await createRelationAction({
        sourceId: object.id,
        targetId: targetId,
        relationId: relationType,
      });

      setTargetId("");
      onRelationCreated();
      router.refresh();
    } catch (err) {
      console.error("Fout bij toevoegen relatie:", err);
      alert("Kon de relatie niet toevoegen.");
    } finally {
      setIsAddingRelation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      {/* DRAWER CONTAINER */}
      <div className="w-full sm:w-[550px] md:w-[650px] lg:w-[700px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* HEADER */}
        <header className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-block mb-1">
              Object Beheren
            </span>

            {/* LABEL BEWERKEN OF TONEN */}
            {isEditingLabel ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-lg font-bold border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  autoFocus
                />
                <button
                  onClick={handleSaveLabel}
                  disabled={isSavingLabel}
                  className="px-3 py-1.5 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm shrink-0"
                >
                  {isSavingLabel ? "Opslaan..." : "Opslaan"}
                </button>
                <button
                  onClick={() => {
                    setLabel(object.label);
                    setIsEditingLabel(false);
                  }}
                  className="px-2 py-1.5 text-slate-500 text-xs hover:text-slate-700 shrink-0"
                >
                  Annuleren
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl font-bold text-slate-900 truncate">
                  {object.label}
                </h2>
                <button
                  onClick={() => setIsEditingLabel(true)}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-200/60 transition shrink-0"
                  title="Naam van object bewerken"
                >
                  ✏️
                </button>
              </div>
            )}

            <p className="text-xs text-slate-500 font-mono">ID: {object.id}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition shrink-0"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </header>

        {/* BODY (Scrollbaar) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTIE: EIGENSCHAPPEN */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Eigenschappen
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Status:</span>
                <span className="font-medium text-slate-800">
                  {object.isConfidential ? "🔒 Vertrouwelijk" : "🌐 Publiek"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Opslag:</span>
                <span className="font-medium text-slate-800">
                  {object.isConfidential ? "Lokaal (SQLite)" : "Turso Cloud"}
                </span>
              </div>
            </div>
          </section>

          {/* SECTIE: ONDERLIGGEND OBJECT KOPPELEN */}
          <section className="space-y-4 border-t border-slate-200 pt-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Onderliggend object koppelen
              </h3>
              <p className="text-xs text-slate-500">
                Voeg een nieuw object toe als onderdeel/uitgaande relatie van <strong>{object.label}</strong>.
              </p>
            </div>

            <form onSubmit={handleAddRelation} className="space-y-4">
              
              {/* SELECTIE OBJECT */}
              <div className="space-y-1 w-full min-w-0">
                <label className="text-xs font-semibold text-slate-700 block">
                  Selecteer onderdeel:
                </label>
                <div className="w-full min-w-0">
                  <ObjectSelector
                    label="Onderdeel:"
                    allObjects={availableObjectsForRelation}
                    selectedObjectId={targetId}
                    onSelect={(id) => setTargetId(id)}
                  />
                </div>
              </div>

              {/* RELATIE TYPE */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Relatietype:
                </label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="heeft_onderdeel">heeft als onderdeel</option>
                  <option value="bevat">bevat</option>
                  <option value="gekoppeld_aan">gekoppeld aan</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!targetId || isAddingRelation}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex justify-center items-center gap-2"
              >
                {isAddingRelation ? "Koppelen..." : "➕ Onderdeel Koppelen"}
              </button>
            </form>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl transition shadow-sm"
          >
            Sluiten
          </button>
        </footer>
      </div>
    </div>
  );
}