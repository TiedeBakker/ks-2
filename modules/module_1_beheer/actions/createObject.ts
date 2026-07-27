// src/modules/module_1_beheer/actions/createObject.ts
"use server";

import { hybridDb } from "@/core/db/hybrid";
import { revalidatePath } from "next/cache";
import { v7 as uuidv7 } from "uuid";

export interface CreateObjectInput {
  label: string;
  validFrom?: string; // ISO string
  isConfidential: boolean;
  // Optionele relatie-koppeling
  relatedObjectId?: string;
  relationDirection?: "INCOMING" | "OUTGOING";
}

export async function createObjectAction(input: CreateObjectInput) {
  try {
    if (!input.label || input.label.trim() === "") {
      return { success: false, error: "Label is verplicht." };
    }

    // 1. Unieke UUIDv7 genereren
    const id = uuidv7();
    const validFrom = input.validFrom || new Date().toISOString();

    // 2. Sla het object op via hybridDb
    const newObj = await hybridDb.createObject({
      id,
      label: input.label.trim(),
      objectTypeId: input.objectTypeId,
      validFrom,
      isConfidential: input.isConfidential,
    });

    // 3. Directe relatie-koppeling als er een gerelateerd object is meegegeven
    if (input.relatedObjectId && input.relationDirection) {
      const relId = uuidv7();
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
/**
 * Haalt alle beschikbare objecttypen op uit de database
 */
export async function getObjectTypesAction() {
  try {
    const types = await hybridDb.getObjectTypes();
    return { success: true, data: types };
  } catch (error: any) {
    console.error("Fout bij ophalen objecttypen:", error);
    return { success: false, data: [] };
  }
}
export interface CreateObjectInput {
  label: string;
  objectTypeId?: string; // <-- VOEG DIT VELD TOE
  validFrom?: string;
  isConfidential: boolean;
  relatedObjectId?: string;
  relationDirection?: "INCOMING" | "OUTGOING";
}

