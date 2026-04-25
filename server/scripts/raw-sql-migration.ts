import { db } from '../db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Adding columns to candidates table...');
  try {
    await db.execute(sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS registration_stage TEXT;`);
    await db.execute(sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS onboarding_source TEXT;`);
    console.log('Columns added successfully.');
    
    console.log('Migrating existing candidates...');
    await db.execute(sql`UPDATE candidates SET registration_stage = 'completed' WHERE registration_stage IS NULL;`);
    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
