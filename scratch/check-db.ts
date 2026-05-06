import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function check() {
  try {
    const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log("Tables:", result.rows.map(r => r.table_name));
    
    const nudgesResult = await db.execute(sql`SELECT * FROM nudges LIMIT 1`);
    console.log("Nudges row:", nudgesResult.rows[0]);
    
    const reqsResult = await db.execute(sql`SELECT * FROM requirements LIMIT 1`);
    console.log("Requirements row:", reqsResult.rows[0]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

check();
