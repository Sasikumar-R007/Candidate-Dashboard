import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("neon.tech") ||
    process.env.DATABASE_URL.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

const checks = [
  ["job_applications", "is_candidate_confirmed"],
  ["requirements", "split_requirement"],
  ["requirements", "source_details"],
  ["requirements", "talent_advisor_id"],
  ["profile_media", "id"],
  ["revenue_mappings", "in_revenue_data"],
];

let failed = 0;
for (const [table, column] of checks) {
  const r = await pool.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
    [table, column],
  );
  const ok = r.rows.length > 0;
  console.log(`${ok ? "OK" : "MISSING"} ${table}.${column}`);
  if (!ok) failed++;
}

await pool.end();
process.exit(failed ? 1 : 0);
