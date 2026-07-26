// src/modules/module_1_beheer/ui/CreateObjectModal.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { createObjectAction } from "../actions/createObject";

interface CreateObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newObjectId: string) => void;
  // Voorbereid op directe relatie-koppeling
  relatedObjectId?: string;
  relationDirection?: "INCOMING" | "OUTGOING";
  relatedObjectLabel?: string;
}

export function CreateObjectModal({
  isOpen,
  onClose,
  onCreated,
  relatedObjectId,
  relationDirection,
  relatedObjectLabel,
}: CreateObjectModalProps) {
  // ISO-string voor datum/tijd nu ingesteld voor datetime-local input (YYYY-MM-DDTHH:mm)
  const getNowForInput = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [label, setLabel] = useState("");
  const [validFrom, setValidFrom] = useState(getNowForInput());
  const [isConfidential, setIsConfidential] = useState(false);
  const [isVercel, setIsVercel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check of de app op Vercel / productie draait
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isVercelHost =
        window.location.hostname.includes("vercel.app") ||
        process.env.NEXT_PUBLIC_VERCEL_ENV !== undefined;
      setIsVercel(isVercelHost);
      if (isVercelHost) {
        setIsConfidential(false); // Op Vercel per definitie Publiek
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!label.trim()) {
      setErrorMessage("Vul a.u.b. een label in.");
      return;
    }

    setIsSubmitting(true);

    const result = await createObjectAction({
      label,
      validFrom: new Date(validFrom).toISOString(),
      isConfidential: isVercel ? false : isConfidential,
      relatedObjectId,
      relationDirection,
    });

    setIsSubmitting(false);

    if (result.success && result.object) {
      // Reset form
      setLabel("");
      setValidFrom(getNowForInput());
      setIsConfidential(false);
      onCreated(result.object.id);
      onClose();
    } else {
      setErrorMessage(result.error || "Fout bij opslaan.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <header className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Nieuw Object Aanmaken</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {/* Indien er een directe relatie gekoppeld wordt */}
          {relatedObjectId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <strong>Automatische koppeling:</strong> Dit object wordt als{" "}
              {relationDirection === "INCOMING" ? "onderliggend" : "bovenliggend"} object
              gekoppeld aan <em>"{relatedObjectLabel || relatedObjectId}"</em>.
            </div>
          )}

          {/* VELD 1: LABEL */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Label / Naam *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Bijv. Planten, Eik, etc."
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* VELD 2: VALID FROM */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Geldig vanaf (ValidFrom)
            </label>
            <input
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* VELD 3: VERTROUWELIJK / PUBLIEK */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
              Opslaglocatie / Vertrouwelijkheid
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  type="radio"
                  name="confidentiality"
                  checked={!isConfidential}
                  onChange={() => setIsConfidential(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-green-700">Publiek (Turso Cloud)</span>
              </label>

              <label
                className={`flex items-center gap-2 text-sm ${
                  isVercel
                    ? "opacity-50 cursor-not-allowed text-slate-400"
                    : "cursor-pointer text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="confidentiality"
                  disabled={isVercel}
                  checked={isConfidential}
                  onChange={() => !isVercel && setIsConfidential(true)}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-amber-700">
                  Vertrouwelijk (Lokaal SQLite)
                </span>
              </label>
            </div>
            {isVercel && (
              <p className="text-xs text-slate-400 mt-1 italic">
                * Op Vercel is alleen 'Publiek' beschikbaar.
              </p>
            )}
          </div>

          {/* ACTIEKNOPPEN */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition disabled:opacity-50"
            >
              {isSubmitting ? "Opslaan..." : "Object Opslaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}