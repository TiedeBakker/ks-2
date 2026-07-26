// src/modules/module_1_beheer/ui/ObjectDetailDrawer.tsx
"use client";

import { useEffect } from "react";
import { ObjectItem } from "@/core/ui/ObjectSelector";

interface ObjectDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  object: (ObjectItem & { isConfidential?: boolean }) | null;
}

export function ObjectDetailDrawer({
  isOpen,
  onClose,
  object,
}: ObjectDetailDrawerProps) {
  // Sluit de drawer bij 'Escape'
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !object) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Transparante/Gedompte achtergrond (Backdrop) */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* CONTAINER: Op mobiel onderaan, op desktop rechts */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto flex max-h-[90vh] sm:max-h-full max-w-full">
        {/* HET PANEEL: Afgerond van boven op mobiel, strak van rechts op desktop */}
        <div className="w-full sm:w-screen sm:max-w-md bg-white rounded-t-2xl sm:rounded-none shadow-2xl border-t sm:border-t-0 sm:border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
          
          {/* MOBIELE 'SWIPE/HANDLE' BAR */}
          <div className="w-full flex justify-center pt-2 pb-1 sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </div>

          {/* HEADER */}
          <div className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-50 border-b flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full uppercase tracking-wider">
              Beheer & Raadpleging
            </span>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 text-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Sluiten"
            >
              ✕
            </button>
          </div>

          {/* INHOUD */}
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
            {/* TITEL & LABEL */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Object Label
              </label>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                {object.label}
              </h2>
            </div>

            {/* METADATA KAART */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Unieke ID (UUIDv7)</span>
                <code className="text-xs bg-white px-2 py-1.5 rounded border text-slate-800 font-mono block mt-1 select-all break-all">
                  {object.id}
                </code>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
                <span className="text-slate-600 font-medium text-xs">Opslaglocatie:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    object.isConfidential
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {object.isConfidential ? "Vertrouwelijk (Lokaal)" : "Publiek (Turso)"}
                </span>
              </div>
            </div>

            {/* GERESERVEERD VOOR RELATIES IN DE VOLGENDE STAP */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
              <strong className="font-semibold block text-sm">💡 Volgende stap:</strong>
              <p className="leading-relaxed">
                In de volgende stap gaan we hier de knoppen toevoegen om direct onderliggende of bovenliggende relaties te koppelen!
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-slate-50 border-t flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition shadow"
            >
              Sluiten
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}