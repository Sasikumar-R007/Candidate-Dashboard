import * as schema from "@shared/schema";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if this is a local database (localhost or 127.0.0.1)
const isLocalDatabase = process.env.DATABASE_URL.includes('localhost') || 
                        process.env.DATABASE_URL.includes('127.0.0.1') ||
                        (!process.env.DATABASE_URL.includes('neon.tech') && 
                         !process.env.DATABASE_URL.includes('sslmode=require'));

// Parse connection string and remove SSL requirements for local databases
let connectionConfig: any = {
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

if (isLocalDatabase) {
  // For local PostgreSQL, disable SSL
  connectionConfig.connectionString = process.env.DATABASE_URL;
  connectionConfig.ssl = false;
} else {
  // For cloud databases (Neon, etc.), use SSL
  connectionConfig.connectionString = process.env.DATABASE_URL;
  connectionConfig.ssl = { rejectUnauthorized: false };
}

// Use standard PostgreSQL driver (works with both local and cloud PostgreSQL)
export const pool = new Pool(connectionConfig);

export const db = drizzle({ client: pool, schema });
