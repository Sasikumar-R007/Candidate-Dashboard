import { db } from '../db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Adding parsed_data column to candidates table...');
  try {
    // Add parsed_data if it doesn't exist
    await db.execute(sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_data JSONB;`);
    console.log('Column added successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
