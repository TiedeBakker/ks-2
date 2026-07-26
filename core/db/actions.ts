// src/core/db/actions.ts
"use server";

import { hybridDb } from "./hybrid";
import { revalidatePath } from "next/cache";

export async function updateObjectLabelAction(id: string, label: string) {
  if (!label.trim()) throw new Error("Label mag niet leeg zijn.");
  const updated = await hybridDb.updateObject(id, { label: label.trim() });
  revalidatePath("/beheer");
  return updated;
}

export async function createRelationAction(data: {
  sourceId: string;
  targetId: string;
  relationId?: string;
  validFrom?: string | null;
}) {
  const created = await hybridDb.createRelation(data);
  revalidatePath("/beheer");
  return created;
}

export async function updateRelationAction(
  relationValueId: string,
  data: {
    relationId?: string;
    validFrom?: string | null;
    volgorde?: string | null; // <-- HIER: matcht de DB schema text-kolom
  }
) {
  const updated = await hybridDb.updateRelationValue(relationValueId, data);
  revalidatePath("/beheer");
  return updated;
}

export async function deleteRelationSoftAction(relationValueId: string) {
  const nowISO = new Date().toISOString();
  const updated = await hybridDb.updateRelationValue(relationValueId, {
    validTo: nowISO,
  });
  revalidatePath("/beheer");
  return updated;
}

// NIEUW: Haal de echte relaties op direct uit DB via hybridDb
export async function getOutgoingRelationsAction(sourceId: string) {
  return await hybridDb.getOutgoingRelationsForObject(sourceId);
}

// NIEUW: Haal de beschikbare relatietypes dynamisch op uit de catalogus
export async function getRelationTypesAction() {
  return await hybridDb.getRelationTypes();
}