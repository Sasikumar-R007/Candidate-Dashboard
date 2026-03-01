const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Sasi%400208@localhost:5432/staffos_dev';
const sql = neon(DATABASE_URL);

(async () => {
  try {
    // Find all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('\n=== All Tables ===');
    tables.forEach(row => console.log('  -', row.table_name));
    
    // Search for tables with "registration" or "event" in name
    const relevantTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND (LOWER(table_name) LIKE '%registration%' 
           OR LOWER(table_name) LIKE '%event%'
           OR LOWER(table_name) LIKE '%reg%')
      ORDER BY table_name
    `;
    
    if (relevantTables.length > 0) {
      console.log('\n=== Tables with "registration" or "event" in name ===');
      relevantTables.forEach(row => console.log('  -', row.table_name));
      
      // Get columns for the first relevant table
      const firstTable = relevantTables[0].table_name;
      console.log(`\n=== Columns in "${firstTable}" ===`);
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${firstTable}
        ORDER BY ordinal_position
      `;
      columns.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();





