import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
});

async function main() {
  const tables = await pool.query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log("Tables:", tables.rows.map((r) => r.table_name).join(", ") || "(none)");
  console.log("Table count:", tables.rows.length);

  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM employees) AS employees,
      (SELECT COUNT(*)::int FROM candidates) AS candidates,
      (SELECT COUNT(*)::int FROM clients) AS clients,
      (SELECT COUNT(*)::int FROM users) AS users
  `);
  console.log("Row counts:", counts.rows[0]);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
