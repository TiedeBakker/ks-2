// src/core/ui/RelationTypeSelector.tsx
"use client";

import { useState } from "react";

export interface RelationTypeItem {
  id: string;
  label: string;
}

interface RelationTypeSelectorProps {
  label?: string;
  relationTypes: RelationTypeItem[];
  selectedTypeId?: string;
  onSelect: (id: string) => void;
  onCreateNew?: (newLabel: string) => Promise<void>;
}

export function RelationTypeSelector({
  label = "Relatietype:",
  relationTypes,
  selectedTypeId,
  onSelect,
  onCreateNew,
}: RelationTypeSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newLabel.trim() || !onCreateNew) return;
    setLoading(true);
    await onCreateNew(newLabel.trim());
    setNewLabel("");
    setIsAdding(false);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-1.5 text-left w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {label}
        </label>
      )}

      {!isAdding ? (
        <div className="flex gap-2 w-full">
          <select
            value={selectedTypeId || ""}
            onChange={(e) => onSelect(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Kies een relatietype (optioneel) --</option>
            {relationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          
          {onCreateNew && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg transition"
              title="Nieuw relatietype aanmaken"
            >
              + Nieuw
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Bijv. 'is onderdeel van'..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-white border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !newLabel.trim()}
            className="px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Opslaan"}
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2 py-2 text-xs bg-slate-200 text-slate-600 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}