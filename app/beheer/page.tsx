// src/app/beheer/page.tsx

import { Navbar } from "@/core/ui/Navbar";
import { hybridDb } from "@/core/db/hybrid";
import { getGraphForObject } from "@/modules/module_1_beheer/services/graph";
import { BeheerClientView } from "@/modules/module_1_beheer/ui/BeheerClientView";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function BeheerPage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  // 1. Haal alle objecten op voor de selectie-bouwsteen (alfabetisch)
  const rawObjects = await hybridDb.getAllObjects();
  const allObjects = rawObjects.sort((a, b) => a.label.localeCompare(b.label));

  // 2. Indien geen ID geselecteerd is, pak automatisch het eerste object als standaard
  const selectedObjectId = id || (allObjects.length > 0 ? allObjects[0].id : undefined);

  // 3. Haal de keten op voor het actieve object
  const graphData = selectedObjectId
    ? await getGraphForObject(selectedObjectId)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <BeheerClientView
        allObjects={allObjects}
        selectedObjectId={selectedObjectId}
        graphData={graphData}
      />
    </div>
  );
}