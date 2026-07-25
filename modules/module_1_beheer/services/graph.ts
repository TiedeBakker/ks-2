// src/modules/module_1_beheer/services/graph.ts

import { hybridDb } from "@/core/db/hybrid";

export async function getGraphForObject(objectId: string) {
  // 1. Haal het actieve object op
  const currentObject = await hybridDb.getObjectById(objectId);
  if (!currentObject) return null;

  // =========================================================================
  // --- 1. INGAANDE KETEN (Omhoog naar bronnen / A) ---
  // =========================================================================
  const incomingChain: Array<{
    object: any;
    isBranch: boolean;
    branchCount: number;
    isTerminal: boolean;
  }> = [];

  const visitedIncoming = new Set<string>([objectId]);
  let currentIncomingId = objectId;

  while (true) {
    const relations = await hybridDb.getRelationsForObject(currentIncomingId);
    const incomingRels = relations.filter((r) => r.targetId === currentIncomingId);

    // a. Geen ingaande relaties meer -> Echt beginpunt bereikt
    if (incomingRels.length === 0) {
      if (incomingChain.length > 0) {
        incomingChain[0].isTerminal = true;
      }
      break;
    }

    const sourceIds = Array.from(new Set(incomingRels.map((r) => r.sourceId)));

    // b. Er is EEN RECHTE LIJN (1 voorganger) -> Gewoon toevoegen en doorlopen
    if (sourceIds.length === 1) {
      const nextId = sourceIds[0];
      if (visitedIncoming.has(nextId)) break; // Voorkom oneindige lus
      visitedIncoming.add(nextId);

      const [sourceObj] = await hybridDb.getObjectsByIds([nextId]);
      if (!sourceObj) break;

      incomingChain.unshift({
        object: sourceObj,
        isBranch: false,
        branchCount: 1,
        isTerminal: false,
      });

      currentIncomingId = nextId; // Stap verder omhoog
    } 
    // c. Er is EEN SPLITSING (Meerdere voorgangers) -> Pas jouw regel toe (1 generatie A-1 check) en STOP
    else {
      const parentObjects = await hybridDb.getObjectsByIds(sourceIds);

      for (const obj of parentObjects) {
        // Kijk 1 generatie dieper (A-1)
        const pRels = await hybridDb.getRelationsForObject(obj.id);
        const grandParentRels = pRels.filter((r) => r.targetId === obj.id);

        incomingChain.unshift({
          object: obj,
          isBranch: true,
          branchCount: grandParentRels.length,
          isTerminal: grandParentRels.length === 0,
        });
      }

      // Stop bij de splitsing!
      break;
    }
  }

  // =========================================================================
  // --- 2. UITGAANDE KETEN (Omlaag naar doelen / B) ---
  // =========================================================================
  const outgoingChain: Array<{
    object: any;
    isBranch: boolean;
    branchCount: number;
    isTerminal: boolean;
  }> = [];

  const visitedOutgoing = new Set<string>([objectId]);
  let currentOutgoingId = objectId;

  while (true) {
    const relations = await hybridDb.getRelationsForObject(currentOutgoingId);
    const outgoingRels = relations.filter((r) => r.sourceId === currentOutgoingId);

    // a. Geen uitgaande relaties meer -> Echt eindpunt bereikt
    if (outgoingRels.length === 0) {
      if (outgoingChain.length > 0) {
        outgoingChain[outgoingChain.length - 1].isTerminal = true;
      }
      break;
    }

    const targetIds = Array.from(new Set(outgoingRels.map((r) => r.targetId)));

    // b. Er is EEN RECHTE LIJN (1 opvolger) -> Gewoon toevoegen en doorlopen
    if (targetIds.length === 1) {
      const nextId = targetIds[0];
      if (visitedOutgoing.has(nextId)) break; // Voorkom oneindige lus
      visitedOutgoing.add(nextId);

      const [targetObj] = await hybridDb.getObjectsByIds([nextId]);
      if (!targetObj) break;

      outgoingChain.push({
        object: targetObj,
        isBranch: false,
        branchCount: 1,
        isTerminal: false,
      });

      currentOutgoingId = nextId; // Stap verder omlaag
    } 
    // c. Er is EEN SPLITSING (Meerdere opvolgers) -> Pas jouw regel toe (1 generatie B+1 check) en STOP
    else {
      const childObjects = await hybridDb.getObjectsByIds(targetIds);

      for (const obj of childObjects) {
        // Kijk 1 generatie dieper (B+1)
        const cRels = await hybridDb.getRelationsForObject(obj.id);
        const grandChildRels = cRels.filter((r) => r.sourceId === obj.id);

        outgoingChain.push({
          object: obj,
          isBranch: true,
          branchCount: grandChildRels.length,
          isTerminal: grandChildRels.length === 0,
        });
      }

      // Stop bij de splitsing!
      break;
    }
  }

  return {
    currentObject,
    incomingChain,
    outgoingChain,
  };
}