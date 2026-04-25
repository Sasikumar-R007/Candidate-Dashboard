import { db, pool } from "./server/db";
import { sql } from "drizzle-orm";

async function exhaustiveCheck() {
  try {
    console.log("Checking profiles table metadata...");
    const result = await pool.query("SELECT * FROM profiles LIMIT 0");
    console.log("Columns found in SELECT *:", result.fields.map(f => f.name));
    
    const infoSchema = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles'");
    console.log("Columns found in information_schema:", infoSchema.rows.map(r => r.column_name));
    
    process.exit(0);
  } catch (error) {
    console.error("Exhaustive check failed:", error);
    process.exit(1);
  }
}

exhaustiveCheck();
