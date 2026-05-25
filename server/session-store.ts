import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type session from "express-session";
import type connectPgSimple from "connect-pg-simple";
import type { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SESSION_TABLE_SQL = readFileSync(
  join(__dirname, "..", "node_modules", "connect-pg-simple", "table.sql"),
  "utf8",
);

/** Create session table before HTTP traffic so the first browser hit does not race migrations. */
export async function ensureSessionStoreTable(pool: Pool): Promise<void> {
  const exists = await pool.query<{ regclass: string | null }>(
    `SELECT to_regclass('public.session') AS regclass`,
  );
  if (exists.rows[0]?.regclass) {
    return;
  }
  await pool.query(SESSION_TABLE_SQL);
}

/** Hold a few connections open so the first session read after listen is less likely to time out. */
export async function warmSessionPool(pool: Pool, count = 3): Promise<void> {
  const clients = [];
  try {
    for (let i = 0; i < count; i += 1) {
      const client = await pool.connect();
      await client.query("SELECT 1");
      clients.push(client);
    }
    await pool.query(`SELECT COUNT(*)::int AS n FROM "session"`);
  } finally {
    for (const client of clients) {
      client.release();
    }
  }
}

export function createPgSessionStore(
  PgSession: ReturnType<typeof connectPgSimple>,
  pool: Pool,
): session.Store {
  return new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: false,
    pruneSessionInterval: 60 * 15,
    errorLog: (err: Error) => {
      console.error("[session] PostgreSQL session store error:", err.message);
    },
  });
}
