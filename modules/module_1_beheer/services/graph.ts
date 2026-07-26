// src/modules/module_1_beheer/services/graph.ts

import { hybridDb } from "@/core/db/hybrid";

export interface ChainNode {
  object: any;
  branchCount: number; // Hoeveel vervolgstappen heeft DIT specifieke object?
  isTerminal: boolean; // Is dit een eindpunt?
}

export interface ChainStep {
  isBranch: boolean; // Is deze laag/stap een splitsing van meerdere objecten?
  nodes: ChainNode[];
}

export async function getGraphForObject(objectId: string) {
  // 1. Haal het actieve object op
  const currentObject = await hybridDb.getObjectById(objectId);
  if (!currentObject) return null;

  // =========================================================================
  // --- 1. INGAANDE KETEN (Omhoog naar bronnen / A) ---
  // =========================================================================
  const incomingChain: ChainStep[] = [];
  const visitedIncoming = new Set<string>([objectId]);
  let currentIncomingId = objectId;

  while (true) {
    const relations = await hybridDb.getRelationsForObject(currentIncomingId);
    const incomingRels = relations.filter((r) => r.targetId === currentIncomingId);

    // a. Geen ingaande relaties meer -> Beginpunt bereikt
    if (incomingRels.length === 0) {
      if (incomingChain.length > 0) {
        incomingChain[0].nodes.forEach((n) => (n.isTerminal = true));
      }
      break;
    }

    const sourceIds = Array.from(new Set(incomingRels.map((r) => r.sourceId)));

    // b. Er is EEN RECHTE LIJN (1 voorganger)
    if (sourceIds.length === 1) {
      const nextId = sourceIds[0];
      if (visitedIncoming.has(nextId)) break;
      visitedIncoming.add(nextId);

      const [sourceObj] = await hybridDb.getObjectsByIds([nextId]);
      if (!sourceObj) break;

      incomingChain.unshift({
        isBranch: false,
        nodes: [
          {
            object: sourceObj,
            branchCount: 1,
            isTerminal: false,
          },
        ],
      });

      currentIncomingId = nextId;
    } 
    // c. Er is EEN SPLITSING (Meerdere voorgangers) -> Naast elkaar zetten en STOP
    else {
      const parentObjects = await hybridDb.getObjectsByIds(sourceIds);
      const branchNodes: ChainNode[] = [];

      for (const obj of parentObjects) {
        const pRels = await hybridDb.getRelationsForObject(obj.id);
        const grandParentRels = pRels.filter((r) => r.targetId === obj.id);

        branchNodes.push({
          object: obj,
          branchCount: grandParentRels.length,
          isTerminal: grandParentRels.length === 0,
        });
      }

      incomingChain.unshift({
        isBranch: true,
        nodes: branchNodes,
      });

      break; // Stop bij de splitsing!
    }
  }

  // =========================================================================
  // --- 2. UITGAANDE KETEN (Omlaag naar doelen / B) ---
  // =========================================================================
  const outgoingChain: ChainStep[] = [];
  const visitedOutgoing = new Set<string>([objectId]);
  let currentOutgoingId = objectId;

  while (true) {
    const relations = await hybridDb.getRelationsForObject(currentOutgoingId);
    const outgoingRels = relations.filter((r) => r.sourceId === currentOutgoingId);

    // a. Geen uitgaande relaties meer -> Eindpunt bereikt
    if (outgoingRels.length === 0) {
      if (outgoingChain.length > 0) {
        const lastStep = outgoingChain[outgoingChain.length - 1];
        lastStep.nodes.forEach((n) => (n.isTerminal = true));
      }
      break;
    }

    const targetIds = Array.from(new Set(outgoingRels.map((r) => r.targetId)));

    // b. Er is EEN RECHTE LIJN (1 opvolger)
    if (targetIds.length === 1) {
      const nextId = targetIds[0];
      if (visitedOutgoing.has(nextId)) break;
      visitedOutgoing.add(nextId);

      const [targetObj] = await hybridDb.getObjectsByIds([nextId]);
      if (!targetObj) break;

      outgoingChain.push({
        isBranch: false,
        nodes: [
          {
            object: targetObj,
            branchCount: 1,
            isTerminal: false,
          },
        ],
      });

      currentOutgoingId = nextId;
    } 
    // c. Er is EEN SPLITSING (Meerdere opvolgers) -> Naast elkaar zetten en STOP
    else {
      const childObjects = await hybridDb.getObjectsByIds(targetIds);
      const branchNodes: ChainNode[] = [];

      for (const obj of childObjects) {
        // Kijk 1 generatie dieper (B+1) voor DIT specifieke kind
        const cRels = await hybridDb.getRelationsForObject(obj.id);
        const grandChildRels = cRels.filter((r) => r.sourceId === obj.id);

        branchNodes.push({
          object: obj,
          branchCount: grandChildRels.length, // Aantal takken onder DIT specifieke depot
          isTerminal: grandChildRels.length === 0,
        });
      }

      outgoingChain.push({
        isBranch: true,
        nodes: branchNodes,
      });

      break; // Stop bij de splitsing!
    }
  }

  return {
    currentObject,
    incomingChain,
    outgoingChain,
  };
}