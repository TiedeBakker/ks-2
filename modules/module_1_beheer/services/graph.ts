// src/modules/module_1_beheer/services/graph.ts

import { hybridDb } from "@/core/db/hybrid";


// Helper om string-volgordes (bijv. "0", "1", "10", null) waterdicht als getal te vergelijken
function parseVolgorde(val?: string | null): number {
  if (val === null || val === undefined || (typeof val === "string" && val.trim() === "")) return Infinity;
  const num = typeof val === "number" ? val : parseInt(val, 10);
  return isNaN(num) ? Infinity : num;
}

export async function getGraphForObject(objectId: string) {
  const currentObject = await hybridDb.getObjectById(objectId);
  if (!currentObject) return null;

  const rawGraph = await hybridDb.getGraphForObject(objectId);
  if (!rawGraph) return null;

  // 1. Ingaande knopen mappen
  const incomingNodes = rawGraph.incoming
    .filter((inc) => inc.sourceObject)
    .map((inc) => ({
      object: {
        id: inc.sourceObject!.id,
        label: inc.sourceObject!.label,
        isConfidential: inc.sourceObject!.isConfidential ?? false,
        // Sla relatiegegevens op het object op voor eventueel gebruik
        relationValueId: inc.relation.id,
        relationId: inc.relation.relationId,
        volgorde: inc.relation.volgorde,
      },
      branchCount: 0,
      isTerminal: false,
    }));

  // 2. Uitgaande knopen mappen + direct sorteren op volgorde
  const outgoingNodes = rawGraph.outgoing
    .filter((out) => out.targetObject)
    .map((out) => ({
      object: {
        id: out.targetObject!.id,
        label: out.targetObject!.label,
        isConfidential: out.targetObject!.isConfidential ?? false,
        // Sla relatiegegevens op het object op voor de drawer
        relationValueId: out.relation.id,
        relationId: out.relation.relationId,
        volgorde: out.relation.volgorde,
      },
      branchCount: 0,
      isTerminal: false,
    }))
    .sort((a, b) => parseVolgorde(a.object.volgorde) - parseVolgorde(b.object.volgorde));

  // Inpakken in de ChainStep structuren die BeheerClientView verwacht:
  const incomingChain = incomingNodes.length > 0 
    ? [{ isBranch: incomingNodes.length > 1, nodes: incomingNodes }] 
    : [];

  const outgoingChain = outgoingNodes.length > 0 
    ? [{ isBranch: outgoingNodes.length > 1, nodes: outgoingNodes }] 
    : [];

  return {
    currentObject: {
      id: currentObject.id,
      label: currentObject.label,
      isConfidential: currentObject.isConfidential ?? false,
    },
    incomingChain,
    outgoingChain,
  };
}