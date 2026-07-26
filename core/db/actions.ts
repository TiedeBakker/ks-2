// src/core/db/actions.ts
"use server";

import { hybridDb } from "./hybrid";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

/**
 * Server Action om het label van een object bij te werken
 */
export async function updateObjectLabelAction(id: string, label: string) {
  if (!label.trim()) {
    throw new Error("Label mag niet leeg zijn.");
  }

  const updated = await hybridDb.updateObject(id, { label: label.trim() });
  
  // Ververs de cache voor het beheerscherm
  revalidatePath("/beheer");
  
  return updated;
}

/**
 * Server Action om een nieuwe relatie aan te maken
 */
export async function createRelationAction(data: {
  sourceId: string;
  targetId: string;
  relationId?: string;
}) {
  const created = await hybridDb.createRelation(data);
  
  // Ververs de cache voor het beheerscherm
  revalidatePath("/beheer");
  
  return created;
}