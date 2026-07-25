// src/core/db/hybrid.ts

import { eq, or, inArray } from "drizzle-orm";
import { publicDb, localDb, isLocalDbAvailable } from "./clients";
import * as schema from "./schema";

export const hybridDb = {
  /**
   * LEZEN: Haalt een object op op basis van ID.
   * Zoekt eerst lokaal (als dat kan) en anders in Turso.
   */
  async getObjectById(id: string) {
    // 1. Probeer lokaal te zoeken als de lokale DB beschikbaar is
    if (isLocalDbAvailable() && localDb) {
      const localResult = await localDb
        .select()
        .from(schema.objects)
        .where(eq(schema.objects.id, id))
        .get();

      if (localResult) return localResult;
    }

    // 2. Zoek in de publieke Turso DB
    return await publicDb
      .select()
      .from(schema.objects)
      .where(eq(schema.objects.id, id))
      .get();
  },

  /**
   * LEZEN: Haalt alle relaties op voor een specifiek object (zowel inkomend als uitgaand).
   * Combineert resultaten uit Turso én de lokale DB als die beschikbaar is.
   */
  async getRelationsForObject(objectId: string) {
    // Haal publieke relaties op
    const publicRelationsPromise = publicDb
      .select()
      .from(schema.relationValues)
      .where(
        or(
          eq(schema.relationValues.sourceId, objectId),
          eq(schema.relationValues.targetId, objectId)
        )
      );

    // Haal vertrouwelijke relaties op (indien lokaal beschikbaar)
    const localRelationsPromise =
      isLocalDbAvailable() && localDb
        ? localDb
            .select()
            .from(schema.relationValues)
            .where(
              or(
                eq(schema.relationValues.sourceId, objectId),
                eq(schema.relationValues.targetId, objectId)
              )
            )
        : Promise.resolve([]);

    // Voer beide query's parallel uit
    const [publicRelations, localRelations] = await Promise.all([
      publicRelationsPromise,
      localRelationsPromise,
    ]);

    // Combineer de lijsten
    return [...publicRelations, ...localRelations];
  },

  /**
   * SCHRIJVEN: Slaat een nieuw object op in de juiste database.
   * Bepaalt automatisch de bestemming op basis van `isConfidential`.
   */
  async createObject(data: typeof schema.objects.$inferInsert) {
    if (data.isConfidential) {
      if (!isLocalDbAvailable() || !localDb) {
        throw new Error(
          "Kan geen vertrouwelijk object opslaan: Lokale database is niet beschikbaar."
        );
      }
      return await localDb.insert(schema.objects).values(data).returning();
    } else {
      return await publicDb.insert(schema.objects).values(data).returning();
    }
  },

  /**
   * LEZEN: Haalt meerdere objecten tegelijk op (handig bij graph traversal).
   */
  async getObjectsByIds(ids: string[]) {
    if (ids.length === 0) return [];

    const publicObjectsPromise = publicDb
      .select()
      .from(schema.objects)
      .where(inArray(schema.objects.id, ids));

    const localObjectsPromise =
      isLocalDbAvailable() && localDb
        ? localDb
            .select()
            .from(schema.objects)
            .where(inArray(schema.objects.id, ids))
        : Promise.resolve([]);

    const [publicObjects, localObjects] = await Promise.all([
      publicObjectsPromise,
      localObjectsPromise,
    ]);

    // Maak een Map om dubbelingen te voorkomen (lokaal heeft voorrang als ID overlapt)
    const objectMap = new Map();
    publicObjects.forEach((obj) => objectMap.set(obj.id, obj));
    localObjects.forEach((obj) => objectMap.set(obj.id, obj));

    return Array.from(objectMap.values());
  },
};