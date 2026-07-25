// src/modules/module_1_beheer/services/graph.ts

import { hybridDb } from "@/core/db/hybrid";
import * as schema from "@/core/db/schema";

export interface ChainNode {
  object: typeof schema.objects.$inferSelect;
  relation?: typeof schema.relationValues.$inferSelect;
  isBranch: boolean;    // Is dit een splitsing? (>1 relaties)
  isTerminal: boolean;  // Is dit een eindpunt? (0 relaties)
  branchCount: number;  // Aantal vertakkingen op dit punt
}

export interface GraphTraversalResult {
  currentObject: typeof schema.objects.$inferSelect;
  incomingChain: ChainNode[];
  outgoingChain: ChainNode[];
}

/**
 * Bouwt een keten op in één richting ('incoming' of 'outgoing')
 * zolang er exact 1 relatie is per stap.
 */
async function buildChain(
  startObjectId: string,
  direction: "incoming" | "outgoing"
): Promise<ChainNode[]> {
  const chain: ChainNode[] = [];
  let currentId = startObjectId;
  const visitedIds = new Set<string>([startObjectId]); // Voorkom oneindige lussen

  while (currentId) {
    // Haal alle relaties op via de Hybride DB
    const allRelations = await hybridDb.getRelationsForObject(currentId);

    // Filter op richting:
    // Ingaand: dit object is de 'target' van een relatie
    // Uitgaand: dit object is de 'source' van een relatie
    const relevantRelations = allRelations.filter((rel) =>
      direction === "incoming"
        ? rel.targetId === currentId
        : rel.sourceId === currentId
    );

    // Case 1: Geen relaties (Eindpunt)
    if (relevantRelations.length === 0) {
      if (chain.length > 0) {
        chain[chain.length - 1].isTerminal = true;
      }
      break;
    }

    // Case 2: Meerdere relaties (Splitsing)
    if (relevantRelations.length > 1) {
      if (chain.length > 0) {
        chain[chain.length - 1].isBranch = true;
        chain[chain.length - 1].branchCount = relevantRelations.length;
      }
      break; // Stop met doortrekken van de rechte lijn
    }

    // Case 3: Exact 1 relatie -> trek de lijn door
    const singleRelation = relevantRelations[0];
    const nextObjectId =
      direction === "incoming" ? singleRelation.sourceId : singleRelation.targetId;

    // Beveiliging tegen circulaire relaties
    if (visitedIds.has(nextObjectId)) {
      if (chain.length > 0) {
        chain[chain.length - 1].isTerminal = true;
      }
      break;
    }

    const nextObject = await hybridDb.getObjectById(nextObjectId);
    if (!nextObject) break;

    visitedIds.add(nextObjectId);

    chain.push({
      object: nextObject,
      relation: singleRelation,
      isBranch: false,
      isTerminal: false,
      branchCount: 1,
    });

    currentId = nextObjectId;
  }

  return chain;
}

/**
 * Hoofdfunctie voor Module 1: Haalt het startobject + inkomende en uitgaande ketens op.
 */
export async function getGraphForObject(
  objectId: string
): Promise<GraphTraversalResult | null> {
  const currentObject = await hybridDb.getObjectById(objectId);
  if (!currentObject) return null;

  const [incomingChain, outgoingChain] = await Promise.all([
    buildChain(objectId, "incoming"),
    buildChain(objectId, "outgoing"),
  ]);

  return {
    currentObject,
    incomingChain,
    outgoingChain,
  };
}