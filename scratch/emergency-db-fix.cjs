
require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function checkAndFix() {
  try {
    console.log("Checking database schema...");
    
    // Add status_note to job_applications
    await pool.query('ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS "status_note" text');
    console.log("Verified status_note in job_applications");

    // Add responded_at to nudges
    await pool.query('ALTER TABLE nudges ADD COLUMN IF NOT EXISTS "responded_at" timestamp');
    console.log("Verified responded_at in nudges");

    console.log("Database schema fix completed successfully.");
  } catch (error) {
    console.error("Error fixing database schema:", error);
  } finally {
    await pool.end();
  }
}

checkAndFix();
