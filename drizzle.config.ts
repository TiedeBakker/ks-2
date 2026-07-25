// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./core/db/schema.ts", // Pad naar jouw schema
  out: "./drizzle",
  dialect: "turso", // Drizzle ondersteunt 'turso' direct als dialect!
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});