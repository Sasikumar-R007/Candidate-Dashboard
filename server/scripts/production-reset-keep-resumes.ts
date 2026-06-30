/**
 * Production reset: keep candidates (25k+ resumes), admin employees, and data_entry employees.
 * Clears all other operational / test data.
 *
 * Usage:
 *   # Preview only (no changes):
 *   npx tsx server/scripts/production-reset-keep-resumes.ts --dry-run
 *
 *   # Execute (requires explicit flag):
 *   npx tsx server/scripts/production-reset-keep-resumes.ts --confirm
 *
 * Set DATABASE_URL to the target Neon database before running.
 * Take a Neon backup/snapshot first.
 */
import "dotenv/config";
import { Pool } from "pg";

const KEPT_EMPLOYEE_ROLES = ["admin", "data_entry"] as const;

/** Tables fully cleared. candidates + employees (partial) are handled separately. */
const TABLES_TO_TRUNCATE = [
  "session",
  "users",
  "profiles",
  "job_preferences",
  "skills",
  "activities",
  "password_resets",
  "profile_media",
  "job_applications",
  "candidate_application_comments",
  "nudges",
  "saved_jobs",
  "team_members",
  "team_leader_profile",
  "target_metrics",
  "target_mappings",
  "daily_metrics",
  "daily_metrics_snapshots",
  "meetings",
  "ceo_comments",
  "requirements",
  "archived_requirements",
  "deliveries",
  "client_departments",
  "client_invites",
  "otps",
  "candidate_login_attempts",
  "interview_tracker",
  "interview_tracker_counts",
  "notifications",
  "push_tokens",
  "impact_metrics",
  "clients",
  "chat_rooms",
  "chat_participants",
  "chat_messages",
  "chat_attachments",
  "chat_unread_counts",
  "revenue_mappings",
  "incentive_mappings",
  "cash_outflows",
  "support_conversations",
  "support_messages",
  "bulk_upload_jobs",
  "bulk_upload_files",
  "admin_messages",
  "recruiter_commands",
  "recruiter_jobs",
  "user_activities",
  "consent_logs",
  "requirement_assignments",
  "resume_submissions",
  "app_settings",
] as const;

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  return new Pool({
    connectionString: url,
    ssl:
      url.includes("neon.tech") || url.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

function maskDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url.replace(/^postgresql:/, "http:"));
    if (parsed.password) parsed.password = "***";
    return parsed.toString().replace(/^http:/, "postgresql:");
  } catch {
    return "(unable to parse DATABASE_URL)";
  }
}

async function tableExists(pool: Pool, tableName: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [tableName],
  );
  return Boolean(result.rows[0]?.exists);
}

async function countTable(pool: Pool, tableName: string): Promise<number | null> {
  if (!(await tableExists(pool, tableName))) return null;
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${quoteIdent(tableName)}`,
  );
  return Number(result.rows[0]?.count ?? 0);
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

async function printSnapshot(pool: Pool, label: string) {
  console.log(`\n=== ${label} ===`);
  console.log("Database:", maskDatabaseUrl(process.env.DATABASE_URL!));

  const candidates = await countTable(pool, "candidates");
  const withResumeFile = await pool.query<{ count: string }>(`
    SELECT COUNT(*)::text AS count FROM candidates WHERE resume_file IS NOT NULL AND resume_file <> ''
  `).catch(() => ({ rows: [{ count: "?" }] }));
  const withResumeText = await pool.query<{ count: string }>(`
    SELECT COUNT(*)::text AS count FROM candidates WHERE resume_text IS NOT NULL AND length(resume_text) > 50
  `).catch(() => ({ rows: [{ count: "?" }] }));

  const employeesByRole = await pool.query<{ role: string; count: string }>(`
    SELECT COALESCE(role, '(null)') AS role, COUNT(*)::text AS count
    FROM employees
    GROUP BY role
    ORDER BY role
  `).catch(() => ({ rows: [] as { role: string; count: string }[] }));

  const keptEmployees = await pool.query<{ count: string }>(`
    SELECT COUNT(*)::text AS count FROM employees
    WHERE LOWER(role) = ANY($1::text[])
  `, [KEPT_EMPLOYEE_ROLES]).catch(() => ({ rows: [{ count: "?" }] }));

  const removedEmployees = await pool.query<{ count: string }>(`
    SELECT COUNT(*)::text AS count FROM employees
    WHERE LOWER(role) <> ALL($1::text[])
  `, [KEPT_EMPLOYEE_ROLES]).catch(() => ({ rows: [{ count: "?" }] }));

  console.log("candidates:", candidates);
  console.log("  with resume_file:", withResumeFile.rows[0]?.count);
  console.log("  with resume_text:", withResumeText.rows[0]?.count);
  console.log("employees by role:");
  for (const row of employeesByRole.rows) {
    console.log(`  ${row.role}: ${row.count}`);
  }
  console.log("employees kept (admin + data_entry):", keptEmployees.rows[0]?.count);
  console.log("employees to delete:", removedEmployees.rows[0]?.count);

  const summaryTables = [
    "clients",
    "requirements",
    "job_applications",
    "resume_submissions",
    "target_mappings",
    "revenue_mappings",
    "bulk_upload_jobs",
  ] as const;
  console.log("other tables:");
  for (const table of summaryTables) {
    const count = await countTable(pool, table);
    if (count !== null) console.log(`  ${table}: ${count}`);
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const confirm = process.argv.includes("--confirm");

  if (!dryRun && !confirm) {
    console.error("Refusing to run without --dry-run or --confirm.");
    console.error("  Preview:  npx tsx server/scripts/production-reset-keep-resumes.ts --dry-run");
    console.error("  Execute:  npx tsx server/scripts/production-reset-keep-resumes.ts --confirm");
    process.exit(1);
  }

  const pool = createPool();

  try {
    await printSnapshot(pool, dryRun ? "DRY RUN — before" : "BEFORE reset");

    const adminCount = await pool.query<{ count: string }>(`
      SELECT COUNT(*)::text AS count FROM employees WHERE LOWER(role) = 'admin'
    `);
    if (Number(adminCount.rows[0]?.count ?? 0) === 0) {
      console.warn("\nWARNING: No admin employee exists. After reset you will need seed-demo-admin.ts.");
    }

    const existingTables: string[] = [];
    for (const table of TABLES_TO_TRUNCATE) {
      if (await tableExists(pool, table)) existingTables.push(table);
    }

    console.log(`\nTables to truncate (${existingTables.length}):`);
    console.log(existingTables.join(", "));

    if (dryRun) {
      console.log("\nDRY RUN complete — no changes made.");
      console.log("Run with --confirm after taking a Neon backup.");
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const table of existingTables) {
        await client.query(`TRUNCATE TABLE ${quoteIdent(table)} RESTART IDENTITY CASCADE`);
        console.log(`truncated ${table}`);
      }

      const deleteEmployees = await client.query(`
        DELETE FROM employees
        WHERE LOWER(role) <> ALL($1::text[])
      `, [KEPT_EMPLOYEE_ROLES]);
      console.log(`deleted employees: ${deleteEmployees.rowCount ?? 0}`);

      const updateCandidates = await client.query(`
        UPDATE candidates
        SET
          pipeline_status = 'New',
          assigned_to = NULL,
          added_by = NULL,
          owner_employee_id = NULL,
          owner_role = NULL,
          last_viewed_at = NULL
      `);
      console.log(`updated candidates (pipeline/ownership cleared): ${updateCandidates.rowCount ?? 0}`);

      await client.query("COMMIT");
      console.log("\nTransaction committed.");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    await printSnapshot(pool, "AFTER reset");
    console.log("\nDone. All users must log in again. Verify Source Resume + resume preview in the app.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
