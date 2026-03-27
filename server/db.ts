import * as schema from "@shared/schema";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

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

// Fix the DATABASE_URL if needed
const fixedDatabaseUrl = fixRenderDatabaseUrl(process.env.DATABASE_URL);

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

// Parse connection string and remove SSL requirements for local databases
let connectionConfig: any = {
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
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

export const db = drizzle({ client: pool, schema });

export async function ensureRequirementManagementColumns() {
  await pool.query(`
    ALTER TABLE requirements
    ADD COLUMN IF NOT EXISTS no_of_positions integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS split_requirement boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS source_type text,
    ADD COLUMN IF NOT EXISTS source_details text,
    ADD COLUMN IF NOT EXISTS management_status text NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS management_reason text,
    ADD COLUMN IF NOT EXISTS managed_at text
  `);

  await pool.query(`
    ALTER TABLE archived_requirements
    ADD COLUMN IF NOT EXISTS no_of_positions integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS split_requirement boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS source_type text,
    ADD COLUMN IF NOT EXISTS source_details text,
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'closed',
    ADD COLUMN IF NOT EXISTS management_status text NOT NULL DEFAULT 'closed',
    ADD COLUMN IF NOT EXISTS management_reason text,
    ADD COLUMN IF NOT EXISTS managed_at text
  `);
}
