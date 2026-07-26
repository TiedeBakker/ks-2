// src/modules/module_1_beheer/actions/createObject.ts
"use server";

import { hybridDb } from "@/core/db/hybrid";
import { revalidatePath } from "next/cache";

export interface CreateObjectInput {
  label: string;
  validFrom?: string; // ISO string of YYYY-MM-DDTHH:mm
  isConfidential: boolean;
  // Optionele relatie-koppeling (voor toekomstige stappen)
  relatedObjectId?: string;
  relationDirection?: "INCOMING" | "OUTGOING"; // INCOMING = source -> new, OUTGOING = new -> target
}

export async function createObjectAction(input: CreateObjectInput) {
  try {
    if (!input.label || input.label.trim() === "") {
      return { success: false, error: "Label is verplicht." };
    }

    // 1. Unieke ID genereren
    const id = `obj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const validFrom = input.validFrom || new Date().toISOString();

    // 2. Sla het object op via hybridDb
    const newObj = await hybridDb.createObject({
      id,
      label: input.label.trim(),
      validFrom,
      isConfidential: input.isConfidential,
    });

    // 3. Optioneel: Maak direct een relatie aan als er een gerelateerd object is meegegeven
    if (input.relatedObjectId && input.relationDirection) {
      const relId = `rel_${Date.now()}`;
      if (input.relationDirection === "INCOMING") {
        // relatedObjectId -> newObj.id
        await hybridDb.createRelation({
          id: relId,
          sourceId: input.relatedObjectId,
          targetId: newObj.id,
          validFrom,
          isConfidential: input.isConfidential,
        });
      } else {
        // newObj.id -> relatedObjectId
        await hybridDb.createRelation({
          id: relId,
          sourceId: newObj.id,
          targetId: input.relatedObjectId,
          validFrom,
          isConfidential: input.isConfidential,
        });
      }
    }

    revalidatePath("/beheer");
    return { success: true, object: newObj };
  } catch (error: any) {
    console.error("Fout bij aanmaken object:", error);
    return { success: false, error: error.message || "Er is een fout opgetreden." };
  }
}