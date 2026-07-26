// src/core/db/hybrid.ts

import { publicDb, localDb, isLocalDbAvailable } from "./clients";
import * as schema from "./schema";
import { eq, inArray, or } from "drizzle-orm";

/**
 * Helper om de juiste database-instantie te kiezen:
 * Als het vertrouwelijk is én localDb is beschikbaar -> localDb
 * Anders -> publicDb
 */
function getDb(isConfidential: boolean) {
  if (isConfidential && isLocalDbAvailable() && localDb) {
    return localDb;
  }
  return publicDb;
}

export const hybridDb = {
  /**
   * Haalt één object op op basis van ID (zoekt eerst lokaal, dan publiek)
   */
  async getObjectById(id: string) {
    if (isLocalDbAvailable() && localDb) {
      const localObj = await localDb
        .select()
        .from(schema.objects)
        .where(eq(schema.objects.id, id))
        .get();
      if (localObj) return localObj;
    }

    const publicObj = await publicDb
      .select()
      .from(schema.objects)
      .where(eq(schema.objects.id, id))
      .get();

    return publicObj || null;
  },

  /**
   * Haalt alle relaties op waarin dit object betrokken is (als source OF target)
   */
  async getRelationsForObject(objectId: string) {
    const publicRelations = await publicDb
      .select()
      .from(schema.relationValues)
      .where(
        or(
          eq(schema.relationValues.sourceId, objectId),
          eq(schema.relationValues.targetId, objectId)
        )
      );

    let localRelations: typeof publicRelations = [];
    if (isLocalDbAvailable() && localDb) {
      localRelations = await localDb
        .select()
        .from(schema.relationValues)
        .where(
          or(
            eq(schema.relationValues.sourceId, objectId),
            eq(schema.relationValues.targetId, objectId)
          )
        );
    }

    // Combineer en verwijder eventuele dubbelen op basis van ID
    const relationMap = new Map<string, (typeof publicRelations)[number]>();
    [...publicRelations, ...localRelations].forEach((rel) => {
      relationMap.set(rel.id, rel);
    });

    return Array.from(relationMap.values());
  },

  /**
   * Haalt meerdere objecten tegelijk op via hun ID's
   */
  async getObjectsByIds(ids: string[]) {
    if (ids.length === 0) return [];

    const publicObjects = await publicDb
      .select()
      .from(schema.objects)
      .where(inArray(schema.objects.id, ids));

    let localObjects: typeof publicObjects = [];
    if (isLocalDbAvailable() && localDb) {
      localObjects = await localDb
        .select()
        .from(schema.objects)
        .where(inArray(schema.objects.id, ids));
    }

    const objectMap = new Map<string, (typeof publicObjects)[number]>();
    [...publicObjects, ...localObjects].forEach((obj) => {
      objectMap.set(obj.id, obj);
    });

    return Array.from(objectMap.values());
  },

  /**
   * Haalt alle objecten op uit zowel de publieke (Turso) als lokale (SQLite) DB.
   */
  async getAllObjects() {
    const publicObjects = await publicDb.select().from(schema.objects);

    let localObjects: typeof publicObjects = [];
    if (isLocalDbAvailable() && localDb) {
      localObjects = await localDb.select().from(schema.objects);
    }

    const objectMap = new Map<string, (typeof publicObjects)[number]>();
    [...publicObjects, ...localObjects].forEach((obj) => {
      objectMap.set(obj.id, obj);
    });

    return Array.from(objectMap.values());
  },

  /**
   * Maakt een nieuw object aan (Publiek in Turso of Vertrouwelijk in lokale SQLite)
   */
  async createObject(
    data: Omit<typeof schema.objects.$inferInsert, "id"> & { id?: string }
  ) {
    const isConfidential = data.isConfidential ?? false;
    const db = getDb(isConfidential);

    const newId = data.id || crypto.randomUUID();

    const result = await db
      .insert(schema.objects)
      .values({
        ...data,
        id: newId,
      })
      .returning();

    return result[0];
  },

  /**
   * Maakt een nieuwe relatie aan (Hybride afgehandeld)
   */
  async createRelation(
    data: Omit<typeof schema.relationValues.$inferInsert, "id" | "relationId"> & {
      id?: string;
      relationId?: string;
    }
  ) {
    // 1. Controleer IN DE CODE of bron en doel bestaan (Hybride check)
    const sourceObj = await this.getObjectById(data.sourceId);
    const targetObj = await this.getObjectById(data.targetId);

    if (!sourceObj || !targetObj) {
      throw new Error(
        `Kan relatie niet aanmaken: Bron (${data.sourceId}) of Doel (${data.targetId}) bestaat niet.`
      );
    }

    // 2. Bepaal opslaglocatie (Vertrouwelijk = lokaal, Publiek = Turso)
    const isConfidential = Boolean(
      sourceObj.isConfidential || targetObj.isConfidential
    );
    const db = getDb(isConfidential);

    // 3. Waarborg dat het relatietype bestaat op deze DB
    const relationTypeId = data.relationId || "default-relatie-type";
    const existingType = await db
      .select()
      .from(schema.relations)
      .where(eq(schema.relations.id, relationTypeId))
      .get();

    if (!existingType) {
      await db.insert(schema.relations).values({
        id: relationTypeId,
        label: "Standaard Relatie",
      });
    }

    // 4. Opslaan
    const newId = data.id || crypto.randomUUID();
    const result = await db
      .insert(schema.relationValues)
      .values({
        ...data,
        id: newId,
        relationId: relationTypeId,
        isConfidential,
      })
      .returning();

    return result[0];
  },

  /**
   * Bouwt de complete graaf (ingaand + uitgaand) op voor één specifiek object.
   */
  async getGraphForObject(objectId: string) {
    const startObject = await this.getObjectById(objectId);
    if (!startObject) return null;

    // Haal alle relaties op via de hybride helper
    const allRelations = await this.getRelationsForObject(objectId);

    // Verzamel unieke IDs van gerelateerde objecten
    const relatedObjectIds = new Set<string>();
    allRelations.forEach((rel) => {
      if (rel.sourceId !== objectId) relatedObjectIds.add(rel.sourceId);
      if (rel.targetId !== objectId) relatedObjectIds.add(rel.targetId);
    });

    // Haal de gekoppelde objecten op
    const relatedObjects = await this.getObjectsByIds(Array.from(relatedObjectIds));
    const relatedObjectsMap = new Map(relatedObjects.map((obj) => [obj.id, obj]));

    // Splits op in uitgaand en ingaand
    const outgoing = allRelations
      .filter((rel) => rel.sourceId === objectId)
      .map((rel) => ({
        relation: rel,
        targetObject: relatedObjectsMap.get(rel.targetId),
      }));

    const incoming = allRelations
      .filter((rel) => rel.targetId === objectId)
      .map((rel) => ({
        relation: rel,
        sourceObject: relatedObjectsMap.get(rel.sourceId),
      }));

    return {
      object: startObject,
      outgoing,
      incoming,
    };
  },

  // --- RELATIE TYPES (relations catalogus) ---
  async getRelationTypes() {
    // Relatietypes worden opgehaald uit de publieke/lokale DB
    const db = getDb(false);
    return await db.select().from(schema.relations);
  },

  async createRelationType(input: { id: string; label: string }) {
    const db = getDb(false);
    const [created] = await db.insert(schema.relations).values(input).returning();
    return created;
  },
};