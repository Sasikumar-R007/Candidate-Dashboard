import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
});

async function listTables(): Promise<string[]> {
  const result = await pool.query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  return result.rows.map((r) => r.table_name);
}

async function runSqlFile(filename: string) {
  const path = join(__dirname, "..", "migrations", filename);
  const sql = readFileSync(path, "utf8");
  console.log(`▶ ${filename}`);
  await pool.query(sql);
  console.log(`✓ ${filename}`);
}

async function runSyncDeploymentSchema() {
  const path = join(__dirname, "..", "migrations", "sync_deployment_schema.sql");
  const fullSql = readFileSync(path, "utf8");
  const statements = fullSql
    .split(/;\s*(?=\n|$)/)
    .map((s) => s.replace(/^--.*$/gm, "").trim())
    .filter((s) => s.length > 0);

  console.log(`▶ sync_deployment_schema.sql (${statements.length} statements)`);
  for (const statement of statements) {
    try {
      await pool.query(`${statement};`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  ⚠ ${message.slice(0, 140)}`);
    }
  }
  console.log("✓ sync_deployment_schema.sql");
}

const supplementalMigrations = [
  "add_client_org_schema.sql",
  "add_client_logo.sql",
  "add_jd_fields.sql",
  "add_last_login_at.sql",
  "add_requirement_management_fields.sql",
  "add_sourcing_owner_fields.sql",
  "add_employee_hold_fields.sql",
  "add_recruiter_job_requirement_id.sql",
  "add_revenue_mapping_payment_date.sql",
  "add_incentive_mappings.sql",
  "add_chat_status_fields.sql",
  "chat_migration.sql",
];

async function main() {
  console.log("=== Supplemental DB migration ===\n");
  const before = await listTables();
  console.log("Tables before:", before.length ? before.join(", ") : "(none)");

  const hasCore =
    before.includes("employees") &&
    before.includes("candidates") &&
    before.includes("clients");

  if (!hasCore) {
    console.error(
      "\nCore tables missing. Run drizzle push first:\n  npm run db:push\n",
    );
    process.exit(1);
  }

  await runSyncDeploymentSchema();
  for (const file of supplementalMigrations) {
    try {
      await runSqlFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  ⚠ ${file}: ${message.slice(0, 160)}`);
    }
  }

  const after = await listTables();
  console.log(`\nTables after (${after.length}):`, after.join(", "));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
