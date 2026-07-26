// src/core/ui/ObjectSelector.tsx
"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

export interface ObjectItem {
  id: string;
  label: string;
  isConfidential?: boolean;
}

interface ObjectSelectorProps {
  label: string; // bijv. "Start-object:"
  allObjects: ObjectItem[];
  selectedObjectId?: string;
  onSelect: (objectId: string) => void;
  onNewClick?: () => void;
}

// Helper-functie om % als wildcard te ondersteunen
function matchWithWildcard(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Als er geen % in staat: match vanaf het begin
  if (!lowerQuery.includes("%")) {
    return lowerText.startsWith(lowerQuery);
  }

  // Zet % om naar regex .* en ontsnap overige speciale tekens
  const escapedParts = lowerQuery
    .split("%")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const pattern = lowerQuery.startsWith("%")
    ? escapedParts.join(".*")
    : "^" + escapedParts.join(".*");

  return new RegExp(pattern, "i").test(lowerText);
}

export function ObjectSelector({
  label,
  allObjects,
  selectedObjectId,
  onSelect,
  onNewClick,
}: ObjectSelectorProps) {
  const router = useRouter();
  const selectedObject = allObjects.find((o) => o.id === selectedObjectId);

  const [query, setQuery] = useState(selectedObject?.label || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update de zoektekst als de geselecteerde prop verandert
  useEffect(() => {
    if (selectedObject) {
      setQuery(selectedObject.label);
    }
  }, [selectedObjectId, selectedObject]);

  // Sluit de dropdown bij een klik buiten de component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filteren met ondersteuning voor % wildcard, max 50 resultaten
  const filteredObjects = query.trim() === ""
    ? allObjects.slice(0, 50)
    : allObjects
        .filter((obj) => matchWithWildcard(obj.label, query))
        .sort((a, b) => a.label.localeCompare(b.label))
        .slice(0, 50);

  const handleInputChange = (text: string) => {
    setQuery(text);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleSelectObject = (obj: ObjectItem) => {
    setQuery(obj.label);
    setIsOpen(false);
    onSelect(obj.id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredObjects.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredObjects.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredObjects.length > 0 && filteredObjects[highlightedIndex]) {
        handleSelectObject(filteredObjects[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleDefaultNewClick = () => {
    if (onNewClick) {
      onNewClick();
    } else {
      router.push("/test");
    }
  };

  return (
    <div className="flex items-center gap-3 relative" ref={containerRef}>
      <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
        {label}
      </label>

      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Typ om te zoeken (% als wildcard)..."
          className="w-full px-3 py-1.5 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />

        {/* Dropdown-resultaten */}
        {isOpen && (
          <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg text-sm">
            {filteredObjects.length === 0 ? (
              <li className="px-3 py-2 text-slate-400 italic">Geen objecten gevonden</li>
            ) : (
              filteredObjects.map((obj, index) => (
                <li
                  key={obj.id}
                  onClick={() => handleSelectObject(obj)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between border-b last:border-b-0 border-slate-100 ${
                    index === highlightedIndex ? "bg-blue-50 text-blue-900 font-medium" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{obj.label}</span>
                  <span className="text-xs text-slate-400 font-mono">{obj.id}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handleDefaultNewClick}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition whitespace-nowrap shadow-sm"
        title="Nieuw object aanmaken"
      >
        + Nieuw
      </button>
    </div>
  );
}