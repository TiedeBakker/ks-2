// src/app/test/actions.ts
"use server";

import { hybridDb } from "@/core/db/hybrid";
import { revalidatePath } from "next/cache";

export async function createTestChainAction() {
  const timestamp = new Date().toLocaleTimeString("nl-NL");

  // 1. Maak Publiek Startobject A
  const objA = await hybridDb.createObject({
    label: `Startkennis A (${timestamp})`,
    isConfidential: false,
  });

  // 2. Maak Vertrouwelijk Object B
  const objB = await hybridDb.createObject({
    label: `Interne Details B (${timestamp})`,
    isConfidential: true,
  });

  await hybridDb.createRelation({
    sourceId: objA.id,
    targetId: objB.id,
    // relationId is nu optioneel! hybridDb maakt "default-relatie-type" 
    // aan in de DB als hij nog niet bestaat.
  });

  // 3. Maak Publiek Eindobject C
  const objC = await hybridDb.createObject({
    label: `Publiek Eindresultaat C (${timestamp})`,
    isConfidential: false,
  });

  // 4. Koppel A -> B en B -> C
  await hybridDb.createRelation({
    sourceId: objA.id,
    targetId: objB.id,
  });

  await hybridDb.createRelation({
    sourceId: objB.id,
    targetId: objC.id,
  });

  revalidatePath("/test");
  revalidatePath("/beheer");

  return { success: true, startId: objA.id };
}