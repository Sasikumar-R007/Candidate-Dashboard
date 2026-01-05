// Script to verify the JD fields migration was successful
// Usage: node server/verify-migration.mjs

import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function verifyMigration() {
  try {
    console.log('🔍 Checking if JD fields were added to requirements table...\n');
    
    // Check if jd_file and jd_text columns exist
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'requirements' 
      AND column_name IN ('jd_file', 'jd_text')
      ORDER BY column_name
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ ERROR: JD fields (jd_file, jd_text) were NOT found in requirements table');
      console.log('   The migration may not have run successfully.');
      process.exit(1);
    } else if (result.rows.length === 1) {
      console.log('⚠️  WARNING: Only one JD field found:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
      console.log('   Please check if both columns were added.');
    } else {
      console.log('✅ SUCCESS: Both JD fields are present in requirements table:');
      result.rows.forEach(row => {
        console.log(`   ✅ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      console.log('\n✅ Migration verification: PASSED');
      console.log('   You can now upload JDs with files and text!');
    }
    
  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyMigration();

