import { readFileSync } from "fs";
import { Pool } from "pg";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node server/scripts/run-sql-migration.mjs <path-to.sql>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("neon.tech") ||
    process.env.DATABASE_URL.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

try {
  const sql = readFileSync(file, "utf8");
  console.log("Running", file);
  await pool.query(sql);
  console.log("OK");
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exit(1);
} finally {
  await pool.end();
}
