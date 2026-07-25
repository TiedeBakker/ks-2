// core/db/clients.ts
import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator"; // Importeer migrate
import * as schema from "./schema";

// 1. Turso Client (Publiek)
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const publicDb = drizzle(tursoClient, { schema });

// 2. Lokale SQLite Client (Vertrouwelijk)
let localDbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (process.env.LOCAL_DB_PATH) {
  try {
    const localClient = createClient({
      url: process.env.LOCAL_DB_PATH,
    });
    localDbInstance = drizzle(localClient, { schema });

    // Voer eventuele ontbrekende tabellen automatisch uit op je lokale SQLite DB!
    // (Mocht dit in tsx/script kuren geven, kun je het opvangen in een init-functie)
    migrate(localDbInstance, { migrationsFolder: "./drizzle" });
  } catch (error) {
    console.warn("⚠️ Kon lokale database niet initialiseren of migreren:", error);
  }
}

export const localDb = localDbInstance;
export const isLocalDbAvailable = (): boolean => localDb !== null;