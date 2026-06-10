import * as schema from "@shared/schema";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Fix incomplete Render database hostnames
// Render internal URLs sometimes don't include the full domain
function fixRenderDatabaseUrl(url: string): string {
  // Check if this looks like a Render database hostname (dpg-xxxxx-xxxxx)
  const renderHostnamePattern = /@(dpg-[a-z0-9]+-[a-z0-9]+)(?:\/|$|:)/i;
  const match = url.match(renderHostnamePattern);
  
  if (match && !url.includes('.singapore-postgres.render.com') && !url.includes('.oregon-postgres.render.com') && !url.includes('.frankfurt-postgres.render.com')) {
    // This is a Render database hostname without the full domain
    // Try to detect the region from environment or default to singapore
    // Common Render regions: singapore, oregon, frankfurt
    const region = process.env.RENDER_DB_REGION || 'singapore';
    const fullHostname = `${match[1]}.${region}-postgres.render.com`;
    const fixedUrl = url.replace(match[1], fullHostname);
    console.warn(`Fixed incomplete Render database hostname: ${match[1]} -> ${fullHostname}`);
    return fixedUrl;
  }
  
  return url;
}

function ensureSslInConnectionUrl(url: string): string {
  const needsSsl =
    url.includes("render.com") ||
    url.includes("neon.tech") ||
    url.includes("supabase.co");
  if (needsSsl && !/[?&]sslmode=/i.test(url)) {
    return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;
  }
  return url;
}

// Fix the DATABASE_URL if needed
const fixedDatabaseUrl = ensureSslInConnectionUrl(fixRenderDatabaseUrl(process.env.DATABASE_URL));

// Parse the DATABASE_URL to handle URL-encoded passwords properly
function parseDatabaseUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const password = decodeURIComponent(parsedUrl.password || '');
    
    return {
      user: parsedUrl.username,
      password: password,
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port || '5432'),
      database: parsedUrl.pathname.slice(1), // Remove leading '/'
    };
  } catch (error) {
    // If URL parsing fails, fall back to connection string
    return null;
  }
}

// Check if this is a local database (localhost or 127.0.0.1)
const isLocalDatabase = fixedDatabaseUrl.includes('localhost') || 
                        fixedDatabaseUrl.includes('127.0.0.1') ||
                        (!fixedDatabaseUrl.includes('neon.tech') && 
                         !fixedDatabaseUrl.includes('render.com') &&
                         !fixedDatabaseUrl.includes('sslmode=require'));

const remoteDbConnectTimeoutMs = Number.parseInt(
  process.env.PG_CONNECTION_TIMEOUT_MS || "60000",
  10,
);

// Parse connection string and remove SSL requirements for local databases
let connectionConfig: any = {
  // Shared pool (app + sessions). Dev first load opens many parallel Vite + API requests.
  max: Number.parseInt(
    process.env.PG_POOL_MAX || (process.env.NODE_ENV === "production" ? "20" : "15"),
    10,
  ),
  idleTimeoutMillis: isLocalDatabase ? 30000 : 60000,
  connectionTimeoutMillis: isLocalDatabase ? 10000 : remoteDbConnectTimeoutMs,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  maxLifetimeSeconds: isLocalDatabase ? 0 : 300,
};

// Try to parse the connection string for better password handling
const parsedConfig = parseDatabaseUrl(fixedDatabaseUrl);

if (parsedConfig) {
  // Use parsed config for better password handling
  connectionConfig = {
    ...connectionConfig,
    ...parsedConfig,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
  };
} else {
  // Fall back to connection string
  if (isLocalDatabase) {
    // For local PostgreSQL, disable SSL
    connectionConfig.connectionString = fixedDatabaseUrl;
    connectionConfig.ssl = false;
  } else {
    // For cloud databases (Neon, Render, etc.), use SSL
    connectionConfig.connectionString = fixedDatabaseUrl;
    connectionConfig.ssl = { rejectUnauthorized: false };
  }
}

// Use standard PostgreSQL driver (works with both local and cloud PostgreSQL)
export const pool = new Pool(connectionConfig);

pool.on("error", (err) => {
  console.error("[db] Unexpected error on idle pool client:", err.message);
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryablePoolError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}`
      : String(error);
  return /connection terminated|connection timeout|ECONNRESET|ETIMEDOUT|timeout expired/i.test(
    message,
  );
}

/** Retry transient pool errors (common on cold remote Postgres during first page load). */
const poolQuery = pool.query.bind(pool);
(pool as Pool & { query: typeof pool.query }).query = async function queryWithRetry(
  ...args: Parameters<typeof pool.query>
) {
  const maxAttempts = 3;
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await poolQuery(...args);
    } catch (error) {
      lastError = error;
      if (!isRetryablePoolError(error) || attempt === maxAttempts) {
        throw error;
      }
      console.warn(
        `[db] Query failed (attempt ${attempt}/${maxAttempts}), retrying: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await sleep(Math.min(1500 * attempt, 5000));
    }
  }
  throw lastError;
};

export const db = drizzle({ client: pool, schema });

/** Verify DB is reachable before session store / migrations run. */
export async function warmPoolConnections(count = 3): Promise<void> {
  const clients = [];
  try {
    for (let i = 0; i < count; i += 1) {
      clients.push(await pool.connect());
    }
    await pool.query("SELECT 1");
  } finally {
    for (const client of clients) {
      client.release();
    }
  }
}

export async function verifyPoolConnection(maxAttempts = 5): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let client;
    try {
      client = await pool.connect();
      await client.query("SELECT 1");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[db] Connection attempt ${attempt}/${maxAttempts} failed: ${message}`);
      if (attempt === maxAttempts) {
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.min(2000 * attempt, 10000)));
    } finally {
      client?.release();
    }
  }
  return false;
}

async function publicTableExists(tableName: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [tableName],
  );
  return Boolean((result.rows[0] as { exists?: boolean })?.exists);
}

export async function ensureRequirementManagementColumns() {
  await pool.query(`
    ALTER TABLE requirements
    ADD COLUMN IF NOT EXISTS "no_of_positions" integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS "split_requirement" boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "source_type" text,
    ADD COLUMN IF NOT EXISTS "source_details" text,
    ADD COLUMN IF NOT EXISTS "management_status" text NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS "management_reason" text,
    ADD COLUMN IF NOT EXISTS "managed_at" text
  `);

  if (await publicTableExists("archived_requirements")) {
    await pool.query(`
      ALTER TABLE archived_requirements
      ADD COLUMN IF NOT EXISTS "no_of_positions" integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "split_requirement" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "source_type" text,
      ADD COLUMN IF NOT EXISTS "source_details" text,
      ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'closed',
      ADD COLUMN IF NOT EXISTS "management_status" text NOT NULL DEFAULT 'closed',
      ADD COLUMN IF NOT EXISTS "management_reason" text,
      ADD COLUMN IF NOT EXISTS "managed_at" text
    `);
  }
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_activities (
      id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id text NOT NULL,
      actor_name text NOT NULL,
      actor_role text NOT NULL,
      type text NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      target_role text,
      related_id text,
      related_type text,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    ALTER TABLE candidates
    ADD COLUMN IF NOT EXISTS "registration_stage" text NOT NULL DEFAULT 'registered'
  `);

  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "candidate_id" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "applied_jobs_count" text DEFAULT \'0\'');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "highest_qualification" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "college_name" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "skills" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "pedigree_level" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "notice_period" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "current_company" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "current_role" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "current_domain" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "company_level" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "product_service" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "course" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "degree_level" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "total_experience" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "graduation_year" text');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "education_history" jsonb');
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "salary_range" text');

  // Also ensure job_preferences table has salary_range
  await pool.query('ALTER TABLE job_preferences ADD COLUMN IF NOT EXISTS "salary_range" text');

  // Employee profile and payroll columns
  await pool.query(`
    ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS "address" text,
    ADD COLUMN IF NOT EXISTS "designation" text,
    ADD COLUMN IF NOT EXISTS "phone" text,
    ADD COLUMN IF NOT EXISTS "department" text,
    ADD COLUMN IF NOT EXISTS "joining_date" text,
    ADD COLUMN IF NOT EXISTS "employment_status" text,
    ADD COLUMN IF NOT EXISTS "esic" text,
    ADD COLUMN IF NOT EXISTS "epfo" text,
    ADD COLUMN IF NOT EXISTS "esic_no" text,
    ADD COLUMN IF NOT EXISTS "epfo_no" text,
    ADD COLUMN IF NOT EXISTS "father_name" text,
    ADD COLUMN IF NOT EXISTS "mother_name" text,
    ADD COLUMN IF NOT EXISTS "father_number" text,
    ADD COLUMN IF NOT EXISTS "mother_number" text,
    ADD COLUMN IF NOT EXISTS "offered_ctc" text,
    ADD COLUMN IF NOT EXISTS "current_status" text,
    ADD COLUMN IF NOT EXISTS "increment_count" text,
    ADD COLUMN IF NOT EXISTS "appraised_quarter" text,
    ADD COLUMN IF NOT EXISTS "appraised_amount" text,
    ADD COLUMN IF NOT EXISTS "appraised_year" text,
    ADD COLUMN IF NOT EXISTS "yearly_ctc" text,
    ADD COLUMN IF NOT EXISTS "current_monthly_ctc" text,
    ADD COLUMN IF NOT EXISTS "name_as_per_bank" text,
    ADD COLUMN IF NOT EXISTS "account_number" text,
    ADD COLUMN IF NOT EXISTS "ifsc_code" text,
    ADD COLUMN IF NOT EXISTS "bank_name" text,
    ADD COLUMN IF NOT EXISTS "branch" text,
    ADD COLUMN IF NOT EXISTS "city" text,
    ADD COLUMN IF NOT EXISTS "profile_picture" text,
    ADD COLUMN IF NOT EXISTS "banner_image" text
  `);

  // Candidate ownership columns
  await pool.query(`
    ALTER TABLE candidates
    ADD COLUMN IF NOT EXISTS "owner_employee_id" varchar(255),
    ADD COLUMN IF NOT EXISTS "owner_role" text
  `);

  // Job ownership and assignment columns
  await pool.query(`
    ALTER TABLE recruiter_jobs
    ADD COLUMN IF NOT EXISTS "owner_employee_id" varchar(255),
    ADD COLUMN IF NOT EXISTS "owner_role" text,
    ADD COLUMN IF NOT EXISTS "assigned_ta_id" varchar(255),
    ADD COLUMN IF NOT EXISTS "assigned_ta_name" text
  `);

  // Application ownership columns
  await pool.query(`
    ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS "owner_employee_id" varchar(255),
    ADD COLUMN IF NOT EXISTS "owner_role" text
  `);

  // Nudge feature columns and table
  await pool.query(`
    ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS "last_nudged_at" timestamp,
    ADD COLUMN IF NOT EXISTS "status_note" text,
    ADD COLUMN IF NOT EXISTS "withdraw_reason" text,
    ADD COLUMN IF NOT EXISTS "is_candidate_confirmed" boolean DEFAULT true
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS nudges (
      id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id varchar(255) NOT NULL,
      candidate_id varchar(255) NOT NULL,
      recruiter_id varchar(255),
      candidate_name text NOT NULL,
      job_title text NOT NULL,
      company text NOT NULL,
      current_status text NOT NULL,
      message text,
      is_read boolean DEFAULT false,
      is_responded boolean DEFAULT false,
      escalation_level text DEFAULT 'recruiter',
      last_escalated_at timestamp NOT NULL DEFAULT now(),
      created_at timestamp NOT NULL DEFAULT now(),
      responded_at timestamp
    )
  `);

  await pool.query(`
    ALTER TABLE nudges
    ADD COLUMN IF NOT EXISTS escalation_level text DEFAULT 'recruiter',
    ADD COLUMN IF NOT EXISTS last_escalated_at timestamp NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS responded_at timestamp
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS candidate_application_comments (
      id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id varchar(255) NOT NULL,
      author_employee_id varchar(255) NOT NULL,
      author_name text NOT NULL,
      author_role text NOT NULL,
      body text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_candidate_application_comments_application_id
    ON candidate_application_comments (application_id)
  `);
}

/** Columns required before Drizzle can SELECT job_applications / recruiter_jobs (Render demo DB). */
export async function ensureCriticalPipelineColumns() {
  await pool.query(`
    ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS requirement_id varchar(255),
    ADD COLUMN IF NOT EXISTS owner_employee_id varchar(255),
    ADD COLUMN IF NOT EXISTS owner_role text,
    ADD COLUMN IF NOT EXISTS source text DEFAULT 'job_board',
    ADD COLUMN IF NOT EXISTS last_nudged_at timestamp,
    ADD COLUMN IF NOT EXISTS status_note text,
    ADD COLUMN IF NOT EXISTS withdraw_reason text,
    ADD COLUMN IF NOT EXISTS rejection_reason text,
    ADD COLUMN IF NOT EXISTS is_candidate_confirmed boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS application_current_ctc text DEFAULT '0',
    ADD COLUMN IF NOT EXISTS application_expected_ctc text DEFAULT '0',
    ADD COLUMN IF NOT EXISTS salary_edited_by_employee_id varchar(255),
    ADD COLUMN IF NOT EXISTS salary_edited_by_name text,
    ADD COLUMN IF NOT EXISTS salary_edited_at timestamp
  `);

  await pool.query(`
    UPDATE job_applications SET source = 'job_board' WHERE source IS NULL
  `);

  await pool.query(`
    ALTER TABLE recruiter_jobs
    ADD COLUMN IF NOT EXISTS owner_employee_id varchar(255),
    ADD COLUMN IF NOT EXISTS owner_role text,
    ADD COLUMN IF NOT EXISTS assigned_ta_id varchar(255),
    ADD COLUMN IF NOT EXISTS assigned_ta_name text,
    ADD COLUMN IF NOT EXISTS requirement_id varchar(255),
    ADD COLUMN IF NOT EXISTS no_of_positions integer DEFAULT 1
  `);

  await pool.query(`
    ALTER TABLE revenue_mappings
    ADD COLUMN IF NOT EXISTS payment_date text,
    ADD COLUMN IF NOT EXISTS in_revenue_data boolean NOT NULL DEFAULT false
  `);
}

/** Admin dashboard tables/columns — run before routes (Render demo DB often lags schema). */
export async function ensureAdminCriticalSchema() {
  await pool.query(`
    ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS hold_message text,
    ADD COLUMN IF NOT EXISTS hold_until text,
    ADD COLUMN IF NOT EXISTS held_at text,
    ADD COLUMN IF NOT EXISTS held_by_employee_id varchar,
    ADD COLUMN IF NOT EXISTS logout_scheduled_at text
  `);

  await pool.query(`
    ALTER TABLE requirements
    ADD COLUMN IF NOT EXISTS talent_advisor_id varchar(255),
    ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS no_of_positions integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS split_requirement boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS source_type text,
    ADD COLUMN IF NOT EXISTS source_details text,
    ADD COLUMN IF NOT EXISTS management_status text NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS management_reason text,
    ADD COLUMN IF NOT EXISTS managed_at text,
    ADD COLUMN IF NOT EXISTS assigned_client_member_id varchar(255),
    ADD COLUMN IF NOT EXISTS jd_file text,
    ADD COLUMN IF NOT EXISTS jd_text text
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS requirement_assignments (
      id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      requirement_id varchar(255) NOT NULL,
      recruiter_id varchar(255) NOT NULL,
      recruiter_name text NOT NULL,
      team_lead_id varchar(255),
      team_lead_name text,
      assigned_date text NOT NULL,
      due_date text,
      status text NOT NULL DEFAULT 'active',
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS resume_submissions (
      id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      requirement_id varchar(255) NOT NULL,
      assignment_id varchar(255),
      recruiter_id varchar(255) NOT NULL,
      recruiter_name text NOT NULL,
      candidate_id varchar(255),
      candidate_name text NOT NULL,
      candidate_email text,
      submitted_at text NOT NULL,
      status text NOT NULL DEFAULT 'submitted',
      notes text,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incentive_mappings (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      revenue_mapping_id varchar NOT NULL,
      candidate_name text,
      team_lead_id varchar NOT NULL,
      team_lead_name text NOT NULL,
      talent_advisor_id varchar NOT NULL,
      talent_advisor_name text NOT NULL,
      quarter text NOT NULL,
      year integer NOT NULL,
      tl_target_amount integer NOT NULL DEFAULT 0,
      ta_target_amount integer NOT NULL DEFAULT 0,
      tl_revenue_amount real NOT NULL DEFAULT 0,
      ta_revenue_amount real NOT NULL DEFAULT 0,
      tl_achieved_amount integer NOT NULL DEFAULT 0,
      ta_achieved_amount integer NOT NULL DEFAULT 0,
      tl_remaining_target integer NOT NULL DEFAULT 0,
      ta_remaining_target integer NOT NULL DEFAULT 0,
      tl_incentive_amount real NOT NULL,
      ta_incentive_amount real NOT NULL,
      bd_incentive_amount real NOT NULL,
      created_at text NOT NULL
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS incentive_mappings_revenue_mapping_id_idx
    ON incentive_mappings (revenue_mapping_id)
  `);

  await pool.query(`
    UPDATE revenue_mappings
    SET in_revenue_data = true
    WHERE in_revenue_data = false
      AND (
        COALESCE(revenue, 0) > 0
        OR COALESCE(incentive, 0) > 0
        OR COALESCE(percentage, 0) > 0
      )
  `);
}

/** Full idempotent schema sync for production DBs that lag behind localhost (drizzle push). */
export async function ensureDeploymentSchema() {
  const sqlPath = join(__dirname, "migrations", "sync_deployment_schema.sql");
  const fullSql = readFileSync(sqlPath, "utf8");
  const statements = fullSql
    .split(/;\s*(?=\n|$)/)
    .map((statement) => statement.replace(/^--.*$/gm, "").trim())
    .filter((statement) => statement.length > 0);

  const archivedRequirementsExists = await publicTableExists("archived_requirements");

  for (const statement of statements) {
    if (
      statement.includes("archived_requirements") &&
      !archivedRequirementsExists &&
      !statement.trimStart().startsWith("DO $$")
    ) {
      continue;
    }
    try {
      await pool.query(`${statement};`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[db] Deployment schema statement failed:", message);
      if (
        statement.includes("job_applications") ||
        statement.includes("recruiter_jobs") ||
        statement.includes("candidate_application_comments") ||
        statement.includes("revenue_mappings")
      ) {
        throw error;
      }
    }
  }
}
