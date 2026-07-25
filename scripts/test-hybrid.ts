// src/scripts/test-hybrid.ts

import { hybridDb } from "../core/db/hybrid";
import { isLocalDbAvailable } from "../core/db/clients";
import { v7 as uuidv7 } from "uuid"; // Of je eigen UUIDv7 generator

async function runTest() {
  console.log("🚀 Start Hybride Database Test...\n");

  console.log(`- Lokale DB beschikbaar? ${isLocalDbAvailable() ? "JA ✅" : "NEE ❌"}`);

  // 1. Maak een Publiek Object aan (Gaat naar Turso)
  const publicObjectId = uuidv7();
  console.log(`\n1. Aanmaken publiek object (${publicObjectId})...`);
  await hybridDb.createObject({
    id: publicObjectId,
    label: "Publiek Test Object (Turso)",
    isConfidential: false,
  });

  // 2. Maak een Vertrouwelijk Object aan (Gaat naar Lokale SQLite)
  const confidentialObjectId = uuidv7();
  if (isLocalDbAvailable()) {
    console.log(`2. Aanmaken vertrouwelijk object (${confidentialObjectId})...`);
    await hybridDb.createObject({
      id: confidentialObjectId,
      label: "Vertrouwelijk Test Object (Lokaal)",
      isConfidential: true,
    });
  } else {
    console.log("2. ⚠️ Slaan vertrouwelijk object over (geen lokale DB).");
  }

  // 3. Haal beide objecten op via de Hybride Wrapper
  console.log("\n3. Ophalen van aangemaakte objecten via hybridDb.getObjectsByIds()...");
  const idsToFetch = [publicObjectId];
  if (isLocalDbAvailable()) idsToFetch.push(confidentialObjectId);

  const fetchedObjects = await hybridDb.getObjectsByIds(idsToFetch);

  console.log("--- RESULTAAT ---");
  console.table(
    fetchedObjects.map((obj) => ({
      ID: obj.id,
      Label: obj.label,
      Vertrouwelijk: obj.isConfidential,
    }))
  );

  if (fetchedObjects.length === idsToFetch.length) {
    console.log("\n✅ TEST GESLAAGD! De hybride laag combineert de data naadloos.");
  } else {
    console.log("\n❌ TEST GEFAALD! Niet alle verwachte objecten zijn opgehaald.");
  }
}

runTest().catch((err) => {
  console.error("\n❌ Fout tijdens test:", err);
});