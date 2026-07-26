// src/modules/module_1_beheer/ui/ObjectDetailDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateObjectLabelAction,
  createRelationAction,
  updateRelationAction,
  deleteRelationSoftAction,
  getOutgoingRelationsAction,
  getRelationTypesAction,
} from "@/core/db/actions";
import { ObjectSelector, ObjectItem } from "@/core/ui/ObjectSelector";

export interface OutgoingRelationItem {
  relationValueId: string;
  relationId: string;
  targetObject: ObjectItem;
  validFrom?: string | null;
  validTo?: string | null;
  volgorde?: string | null; // <-- Matched met het schema
}

interface RelationTypeOption {
  id: string;
  label: string;
}

interface ObjectDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  object: (ObjectItem & { isConfidential?: boolean }) | null;
  allObjects: ObjectItem[];
  onRelationCreated: () => void;
}

export function ObjectDetailDrawer({
  isOpen,
  onClose,
  object,
  allObjects,
  onRelationCreated,
}: ObjectDetailDrawerProps) {
  const router = useRouter();

  // State
  const [label, setLabel] = useState("");
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isSavingLabel, setIsSavingLabel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data uit database
  const [relations, setRelations] = useState<OutgoingRelationItem[]>([]);
  const [relationTypes, setRelationTypes] = useState<RelationTypeOption[]>([]);

  // Nieuwe relatie State
  const [targetId, setTargetId] = useState("");
  const [selectedRelationType, setSelectedRelationType] = useState("");
  const [isAddingRelation, setIsAddingRelation] = useState(false);

  // Direct echte data laden uit de DB zodra drawer opent
  const loadData = async () => {
    if (!object?.id) return;
    setIsLoading(true);
    try {
      const [dbRelations, dbTypes] = await Promise.all([
        getOutgoingRelationsAction(object.id),
        getRelationTypesAction(),
      ]);

      setRelations(dbRelations || []);
      setRelationTypes(dbTypes || []);

      if (dbTypes && dbTypes.length > 0) {
        setSelectedRelationType(dbTypes[0].id);
      }
    } catch (err) {
      console.error("Fout bij ophalen relatiegegevens:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && object) {
      setLabel(object.label);
      setIsEditingLabel(false);
      loadData();
    }
  }, [isOpen, object?.id]);

  if (!isOpen || !object) return null;

  const existingRelatedIds = relations.map((r) => r.targetObject.id);
  const availableObjectsForRelation = allObjects.filter(
    (o) => o.id !== object.id && !existingRelatedIds.includes(o.id)
  );

  // --- HANDLERS ---

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
      alert("Kon de naam niet aanpassen.");
    } finally {
      setIsSavingLabel(false);
    }
  };

  const handleAddRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    setIsAddingRelation(true);
    try {
      await createRelationAction({
        sourceId: object.id,
        targetId: targetId,
        relationId: selectedRelationType || "heeft_onderdeel",
        validFrom: new Date().toISOString().split("T")[0],
      });

      setTargetId("");
      await loadData(); // Direct de nieuwe DB-data inladen
      onRelationCreated();
      router.refresh();
    } catch (err) {
      console.error("Fout bij toevoegen relatie:", err);
      alert("Kon de relatie niet toevoegen.");
    } finally {
      setIsAddingRelation(false);
    }
  };

  // Datum / Type direct updaten in de DB via relationValueId
  const handleUpdateRelation = async (
    relationValueId: string,
    data: { relationId?: string; validFrom?: string | null }
  ) => {
    // 1. Direct op het scherm tonen (lokale state update)
    setRelations((prev) =>
      prev.map((rel) =>
        rel.relationValueId === relationValueId ? { ...rel, ...data } : rel
      )
    );

    // 2. Opslaan in de database
    try {
      await updateRelationAction(relationValueId, data);
      onRelationCreated();
      router.refresh();
    } catch (err) {
      console.error("Fout bij bijwerken relatie in DB:", err);
      alert("Kon relatie niet opslaan in database.");
    }
  };

  const handleDeleteRelation = async (relationValueId: string) => {
    if (!confirm("Weet je zeker dat je deze relatie wilt beëindigen?")) return;

    setRelations((prev) => prev.filter((r) => r.relationValueId !== relationValueId));

    try {
      await deleteRelationSoftAction(relationValueId);
      onRelationCreated();
      router.refresh();
    } catch (err) {
      console.error("Fout bij beëindigen relatie:", err);
      alert("Kon relatie niet beëindigen.");
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newRelations = [...relations];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRelations.length) return;

    const [movedItem] = newRelations.splice(index, 1);
    newRelations.splice(targetIndex, 0, movedItem);

    setRelations(newRelations);
  };

  // Volgorde wijzigen via pijltjes (Naar boven = -1 / null->"0", Naar beneden = +1 / null->"1")
  const handleMoveOrder = async (rel: OutgoingRelationItem, direction: "up" | "down") => {
    const rawVal = rel.volgorde;
    const parsed = rawVal !== null && rawVal !== undefined && rawVal !== "" ? parseInt(rawVal, 10) : NaN;

    let newVolgorde: string;

    if (isNaN(parsed)) {
      // Als er null of niks stond
      newVolgorde = direction === "up" ? "0" : "1";
    } else {
      // Als er al een getal stond
      const nextNum = direction === "up" ? parsed - 1 : parsed + 1;
      newVolgorde = nextNum.toString();
    }

    // 1. Direct lokaal updaten
    setRelations((prev) =>
      prev.map((r) =>
        r.relationValueId === rel.relationValueId ? { ...r, volgorde: newVolgorde } : r
      )
    );

    // 2. Direct opslaan in de database
    try {
      await updateRelationAction(rel.relationValueId, { volgorde: newVolgorde });
      onRelationCreated();
      router.refresh();
    } catch (err) {
      console.error("Fout bij bijwerken volgorde:", err);
      alert("Kon de nieuwe volgorde niet opslaan.");
    }
  };

  // Handmatige invoer van volgorde via het tekstveld
  const handleOrderInputChange = async (relationValueId: string, value: string) => {
    const newVolgorde = value === "" ? null : value;

    setRelations((prev) =>
      prev.map((r) =>
        r.relationValueId === relationValueId ? { ...r, volgorde: newVolgorde } : r
      )
    );

    try {
      await updateRelationAction(relationValueId, { volgorde: newVolgorde });
      onRelationCreated();
      router.refresh();
    } catch (err) {
      console.error("Fout bij handmatig opslaan volgorde:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full sm:w-[550px] md:w-[650px] lg:w-[750px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">

        {/* HEADER */}
        <header className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-block mb-1">
              Object Beheren
            </span>

            {isEditingLabel ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-lg font-bold border border-blue-400 rounded-lg focus:outline-none bg-white"
                  autoFocus
                />
                <button
                  onClick={handleSaveLabel}
                  disabled={isSavingLabel}
                  className="px-3 py-1.5 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 shrink-0"
                >
                  {isSavingLabel ? "Opslaan..." : "Opslaan"}
                </button>
                <button
                  onClick={() => setIsEditingLabel(false)}
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
                  className="p-1 text-slate-400 hover:text-blue-600 rounded shrink-0"
                  title="Naam bewerken"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 font-mono">ID: {object.id}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
          >
            ✕
          </button>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* RELATIES SECTIE */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Bestaande Onderdelen / Uitgaande Relaties ({relations.length})
            </h3>

            {isLoading ? (
              <p className="text-xs text-slate-400 italic">Gegevens laden uit database...</p>
            ) : relations.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                Geen actieve uitgaande relaties gekoppeld aan dit object.
              </p>
            ) : (
              <div className="space-y-2">
                {relations.map((rel, index) => {
                  const formattedDate = rel.validFrom
                    ? new Date(rel.validFrom).toISOString().split("T")[0]
                    : "";

                  return (
                    <div
                      key={rel.relationValueId || index}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">

                          {/* VOLGORDE KNOPPEN + WEERGAVE VAN `volgorde` UIT DB */}
                          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(rel, "up")}
                                className="text-[10px] p-0.5 leading-none text-slate-500 hover:text-blue-600 font-bold"
                                title="Volgorde -1 (of '0' bij null)"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(rel, "down")}
                                className="text-[10px] p-0.5 leading-none text-slate-500 hover:text-blue-600 font-bold"
                                title="Volgorde +1 (of '1' bij null)"
                              >
                                ▼
                              </button>
                            </div>

                            {/* INVOER / WEERGAVE VAN HET ECHTE VOLGORDE VELD */}
                            <div className="flex items-center gap-1 pl-1 border-l border-slate-100">
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">#</span>
                              <input
                                type="text"
                                value={rel.volgorde ?? ""}
                                placeholder="null"
                                onChange={(e) => handleOrderInputChange(rel.relationValueId, e.target.value)}
                                className="w-10 text-center text-xs font-bold text-slate-700 bg-transparent focus:outline-none focus:bg-blue-50 rounded"
                                title="Klik om volgorde direct aan te passen"
                              />
                            </div>
                          </div>

                          <span className="font-semibold text-slate-800 text-sm truncate">
                            {rel.targetObject.label}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteRelation(rel.relationValueId)}
                          className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition shrink-0"
                        >
                          🗑️ Verwijderen
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                        {/* DYNAMISCHE RELATIETYPES UIT DATABASE */}
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                            Type
                          </label>
                          <select
                            value={rel.relationId}
                            onChange={(e) =>
                              handleUpdateRelation(rel.relationValueId, {
                                relationId: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700"
                          >
                            {relationTypes.length > 0 ? (
                              relationTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.label || t.id}
                                </option>
                              ))
                            ) : (
                              <option value={rel.relationId}>{rel.relationId}</option>
                            )}
                          </select>
                        </div>

                        {/* DATUM INVOER EN OPPERVLAK */}
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">
                            Geldig vanaf (validFrom)
                          </label>
                          <input
                            type="date"
                            value={formattedDate}
                            onChange={(e) =>
                              handleUpdateRelation(rel.relationValueId, {
                                validFrom: e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : null,
                              })
                            }
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* KOPPELEN SECTIE */}
          <section className="space-y-4 border-t border-slate-200 pt-6">
            <h3 className="text-base font-bold text-slate-900">Nieuw Onderdeel Koppelen</h3>

            <form onSubmit={handleAddRelation} className="space-y-4">
              <div className="space-y-1 w-full min-w-0">
                <label className="text-xs font-semibold text-slate-700 block">
                  Selecteer onderdeel:
                </label>
                <ObjectSelector
                  label="Onderdeel:"
                  allObjects={availableObjectsForRelation}
                  selectedObjectId={targetId}
                  onSelect={(id) => setTargetId(id)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Relatietype:
                </label>
                <select
                  value={selectedRelationType}
                  onChange={(e) => setSelectedRelationType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  {relationTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label || t.id}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!targetId || isAddingRelation}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl disabled:opacity-50 transition shadow-sm"
              >
                {isAddingRelation ? "Koppelen..." : "➕ Onderdeel Koppelen"}
              </button>
            </form>
          </section>
        </div>

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