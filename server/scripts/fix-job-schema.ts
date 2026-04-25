import 'dotenv/config';
import { db } from "../db";
import { sql } from "drizzle-orm";

async function fixSchema() {
  console.log("Checking for missing columns in recruiter_jobs...");
  
  try {
    // Check if employment_type exists
    const columnCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'recruiter_jobs' AND column_name = 'employment_type'
    `);
    
    if (columnCheck.rowCount === 0) {
      console.log("Adding missing column 'employment_type' to 'recruiter_jobs'...");
      await db.execute(sql`ALTER TABLE recruiter_jobs ADD COLUMN employment_type TEXT;`);
      console.log("Column 'employment_type' added successfully.");
    } else {
      console.log("Column 'employment_type' already exists.");
    }

    // Also check for other new columns just in case
    const otherColumns = ['company_tagline', 'company_type', 'market', 'field', 'secondary_skills', 'knowledge_only'];
    for (const col of otherColumns) {
      const check = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'recruiter_jobs' AND column_name = ${col}
      `);
      if (check.rowCount === 0) {
        console.log(`Adding missing column '${col}' to 'recruiter_jobs'...`);
        await db.execute(sql`ALTER TABLE recruiter_jobs ADD COLUMN ${sql.raw(col)} TEXT;`);
      }
    }
    
    console.log("Schema fix completed.");
  } catch (error) {
    console.error("Error fixing schema:", error);
  } finally {
    process.exit(0);
  }
}

fixSchema();
