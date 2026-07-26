// src/modules/module_1_beheer/actions/relationTypes.ts
"use server";

import { hybridDb } from "@/core/db/hybrid";
import { revalidatePath } from "next/cache";
import { v7 as uuidv7 } from "uuid";

export async function getRelationTypesAction() {
  try {
    const types = await hybridDb.getRelationTypes();
    return { success: true, types };
  } catch (error: any) {
    return { success: false, types: [] };
  }
}

export async function createRelationTypeAction(label: string) {
  try {
    if (!label || label.trim() === "") {
      return { success: false, error: "Label is verplicht." };
    }
    const id = uuidv7();
    const newType = await hybridDb.createRelationType({ id, label: label.trim() });
    revalidatePath("/beheer");
    return { success: true, relationType: newType };
  } catch (error: any) {
    return { success: false, error: error.message || "Fout bij aanmaken relatietype." };
  }
}