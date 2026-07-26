// src/modules/module_1_beheer/actions/createRelation.ts
"use server";

import { hybridDb } from "@/core/db/hybrid";
import { revalidatePath } from "next/cache";
import { v7 as uuidv7 } from "uuid";

export interface CreateRelationInput {
  sourceId: string;
  targetId: string;
  relationTypeId?: string; // Koppelt aan relations.id
  isConfidential?: boolean;
}

export async function createRelationAction(input: CreateRelationInput) {
  try {
    if (!input.sourceId || !input.targetId) {
      return { success: false, error: "Source en Target zijn verplicht." };
    }

    if (input.sourceId === input.targetId) {
      return { success: false, error: "Een object kan geen relatie met zichzelf hebben." };
    }

    const id = uuidv7();

    const newRel = await hybridDb.createRelation({
      id,
      sourceId: input.sourceId,
      targetId: input.targetId,
      relationId: input.relationTypeId,
      isConfidential: input.isConfidential ?? false,
    });

    revalidatePath("/beheer");
    return { success: true, relation: newRel };
  } catch (error: any) {
    console.error("Fout bij aanmaken relatie:", error);
    return { success: false, error: error.message || "Fout bij aanmaken relatie." };
  }
}