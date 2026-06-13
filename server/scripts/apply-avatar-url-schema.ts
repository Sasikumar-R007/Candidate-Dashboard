import "dotenv/config";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const label = process.env.MIGRATION_LABEL || "database";

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS profile_media (
        id varchar(64) PRIMARY KEY,
        mime_type text NOT NULL,
        data text NOT NULL,
        created_at timestamp DEFAULT now()
      )
    `);
    await client.query(`
      ALTER TABLE profile_media
        ADD COLUMN IF NOT EXISTS avatar_url text
    `);

    const stats = await client.query<{
      total: number;
      pending_r2: number;
      migrated: number;
    }>(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE COALESCE(TRIM(avatar_url), '') = ''
            AND COALESCE(TRIM(data), '') != ''
        )::int AS pending_r2,
        COUNT(*) FILTER (
          WHERE COALESCE(TRIM(avatar_url), '') != ''
        )::int AS migrated
      FROM profile_media
    `);

    console.log(`[${label}] profile_media schema OK`);
    console.log(`[${label}] stats:`, stats.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`[${label}] failed:`, error);
  process.exit(1);
});
