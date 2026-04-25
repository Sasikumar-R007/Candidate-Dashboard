
import 'dotenv/config';
import { db } from "../db";
import { sql } from "drizzle-orm";

async function verify() {
  const result = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'recruiter_jobs'
  `);
  console.log("Columns in recruiter_jobs:", result.rows.map(r => r.column_name));
  process.exit(0);
}

verify();
