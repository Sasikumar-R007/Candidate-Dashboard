import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const drizzleDatabaseUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: drizzleDatabaseUrl,
    ssl: drizzleDatabaseUrl?.includes('render.com') || drizzleDatabaseUrl?.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : undefined,
  },
});
