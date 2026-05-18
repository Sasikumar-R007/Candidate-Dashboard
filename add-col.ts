import { pool } from "./server/db.ts";

async function run() {
  try {
    await pool.query(`ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS "is_candidate_confirmed" boolean DEFAULT true`);
    console.log("Column added successfully!");
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

run();
