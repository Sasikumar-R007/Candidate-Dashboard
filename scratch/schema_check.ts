import { db, pool } from "../server/db";
import { profiles, candidates } from "../shared/schema";
import { getTableConfig } from "drizzle-orm/pg-core";

async function checkSchemaMismatch() {
  try {
    const tables = [
      { name: 'profiles', schema: profiles },
      { name: 'candidates', schema: candidates }
    ];

    for (const table of tables) {
      console.log(`Checking table: ${table.name}`);
      const config = getTableConfig(table.schema);
      const schemaColumns = Object.values(config.columns).map(c => c.name);
      
      const result = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table.name}'`);
      const dbColumns = result.rows.map(r => r.column_name);
      
      const missing = schemaColumns.filter(c => !dbColumns.includes(c));
      
      if (missing.length > 0) {
        console.log(`MISSING COLUMNS in ${table.name}:`, missing);
      } else {
        console.log(`No missing columns in ${table.name}.`);
      }
    }
    const extra = dbColumns.filter(c => !schemaColumns.includes(c));
    
    console.log("Schema Columns:", schemaColumns);
    console.log("DB Columns:", dbColumns);
    
    if (missing.length > 0) {
      console.log("MISSING COLUMNS in DB:", missing);
    } else {
      console.log("No missing columns found.");
    }
    
    if (extra.length > 0) {
      console.log("EXTRA COLUMNS in DB (present in DB but not in schema):", extra);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Schema check failed:", error);
    process.exit(1);
  }
}

checkSchemaMismatch();
