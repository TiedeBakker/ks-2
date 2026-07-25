// src/db/schema/schema.ts

import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

//
// Catalogi (Typen, Eenheden, Relatietypen)
//

export const objectTypes = sqliteTable("object_types", {
  id: text("id").primaryKey(), // UUIDv7
  label: text("label").notNull(),
});

export const valueTypes = sqliteTable("value_types", {
  id: text("id").primaryKey(), // UUIDv7
  label: text("label").notNull(),
});

export const units = sqliteTable("units", {
  id: text("id").primaryKey(), // UUIDv7
  label: text("label").notNull(),
  symbol: text("symbol").notNull(),
});

export const relations = sqliteTable("relations", {
  id: text("id").primaryKey(), // UUIDv7
  label: text("label").notNull(),
});

//
// Objecten
//

export const objects = sqliteTable("objects", {
  id: text("id").primaryKey(), // UUIDv7
  
  // Optionele koppeling naar type (indien van toepassing)
  objectTypeId: text("object_type_id").references(() => objectTypes.id),

  label: text("label").notNull(),

  // Vertrouwelijkheid: 0 = Publiek, 1 = Vertrouwelijk
  isConfidential: integer("is_confidential", { mode: "boolean" })
    .notNull()
    .default(false),

  validFrom: text("valid_from"),
  validTo: text("valid_to"),
});

//
// Concrete relaties (Edges tussen Objecten)
//

export const relationValues = sqliteTable("relation_values", {
  id: text("id").primaryKey(), // UUIDv7

  relationId: text("relation_id")
    .notNull()
    .references(() => relations.id), // Deze mag blijven als relations op beide DB's staat

  // WEGGEHAALD: .references(() => objects.id)
  // Dit zijn nu "Soft Keys". De applicatie (hybridDb) borgt de geldigheid!
  sourceId: text("source_id").notNull(),
  targetId: text("target_id").notNull(),

  volgorde: text("volgorde"),

  isConfidential: integer("is_confidential", { mode: "boolean" })
    .notNull()
    .default(false),

  validFrom: text("valid_from"),
  validTo: text("valid_to"),
});

//
// Parameterdefinities
//

export const parameters = sqliteTable("parameters", {
  id: text("id").primaryKey(), // UUIDv7

  label: text("label").notNull(),

  valueTypeId: text("value_type_id").references(() => valueTypes.id),

  unitId: text("unit_id").references(() => units.id),

  validFrom: text("valid_from"),
  validTo: text("valid_to"),
});

//
// Parameterwaarden (Koppeling aan Object óf Relatie)
//

export const parameterValues = sqliteTable("parameter_values", {
  id: text("id").primaryKey(), // UUIDv7

  parameterId: text("parameter_id")
    .notNull()
    .references(() => parameters.id),

  // Wat voor entiteit is dit? 'object' OF 'relation'
  targetType: text("target_type", { enum: ["object", "relation"] })
    .notNull()
    .default("object"),

  // De UUIDv7 van de target (wijst naar objects.id OF relation_values.id)
  targetId: text("target_id").notNull(),

  value: text("value").notNull(),

  // Vertrouwelijkheid: 0 = Publiek, 1 = Vertrouwelijk
  isConfidential: integer("is_confidential", { mode: "boolean" })
    .notNull()
    .default(false),

  validFrom: text("valid_from"),
  validTo: text("valid_to"),
});