// Simple script to run the JD fields migration
// Usage: node server/run-migration.js

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables');
  console.error('Please make sure your .env file has DATABASE_URL set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Read the migration SQL file - support both migrations
    const migrationFile = process.argv[2] === 'last-login' ? 'add_last_login_at.sql' : 'add_jd_fields.sql';
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    if (migrationFile === 'add_last_login_at.sql') {
      console.log('📝 Running migration: Adding last_login_at column...');
    } else {
      console.log('📝 Running migration: Adding jd_file and jd_text columns...');
    }
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    if (migrationFile === 'add_last_login_at.sql') {
      console.log('✅ Column last_login_at has been added to the employees table');
      
      // Verify the column was added
      const result = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'last_login_at'
      `);
      
      if (result.rows.length === 1) {
        console.log('✅ Verification: Column exists in the database');
        result.rows.forEach(row => {
          console.log(`   - ${row.column_name}: ${row.data_type}`);
        });
      } else {
        console.log('⚠️  Warning: Could not verify column. Please check manually.');
      }
    } else {
      console.log('✅ Columns jd_file and jd_text have been added to the requirements table');
      
      // Verify the columns were added
      const result = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'requirements' 
        AND column_name IN ('jd_file', 'jd_text')
      `);
      
      if (result.rows.length === 2) {
        console.log('✅ Verification: Both columns exist in the database');
        result.rows.forEach(row => {
          console.log(`   - ${row.column_name}: ${row.data_type}`);
        });
      } else {
        console.log('⚠️  Warning: Could not verify columns. Please check manually.');
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42703') {
      console.error('   This might mean the columns already exist or there was a different error.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

