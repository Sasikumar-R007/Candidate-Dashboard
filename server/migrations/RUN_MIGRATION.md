# How to Run Client Logo Migration

## Option 1: Using psql (PostgreSQL Command Line)

### Step 1: Get Your Database Connection Details
You need to know:
- Database host (e.g., `localhost`, `your-server.com`, or IP address)
- Database port (usually `5432` for PostgreSQL)
- Database name
- Username
- Password

### Step 2: Run the Migration

**If you have DATABASE_URL environment variable:**
```powershell
# Get the connection string from your .env file or environment
# Format: postgresql://username:password@host:port/database

# Then run:
psql "your-database-url-here" -f server/migrations/add_client_logo.sql
```

**If you have separate connection details:**
```powershell
# Windows PowerShell
$env:PGPASSWORD="your-password"
psql -h your-host -p 5432 -U your-username -d your-database-name -f server/migrations/add_client_logo.sql

# Example:
# psql -h localhost -p 5432 -U postgres -d staffos_db -f server/migrations/add_client_logo.sql
```

**If psql is not in PATH:**
```powershell
# Find psql location (usually in PostgreSQL installation)
# Example: C:\Program Files\PostgreSQL\15\bin\psql.exe

& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -p 5432 -U postgres -d your-database -f server/migrations/add_client_logo.sql
```

## Option 2: Using Database GUI Tool (Recommended for Windows)

### Using pgAdmin, DBeaver, or Azure Data Studio:

1. **Open your database tool**
2. **Connect to your database**
3. **Open SQL Query Editor**
4. **Copy and paste this SQL:**

```sql
-- Add logo column (text field for logo URL)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

-- Add comment to column for documentation
COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
```

5. **Execute the query**

## Option 3: Direct SQL Execution (Simplest)

### Copy this SQL and run it in your database tool:

```sql
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
```

## Option 4: Using Node.js Script (If you have database connection)

Create a temporary script `run-migration.js`:

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_client_logo.sql'), 
      'utf8'
    );
    await client.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
```

Then run:
```powershell
node server/run-migration.js
```

## Finding Your Database Connection Details

### Check Environment Variables:
```powershell
# Check if DATABASE_URL is set
$env:DATABASE_URL

# Or check .env file (if exists)
Get-Content .env | Select-String "DATABASE"
```

### Common Database Connection Formats:
- **Local:** `postgresql://postgres:password@localhost:5432/database_name`
- **Remote:** `postgresql://username:password@host:5432/database_name`
- **Cloud (AWS RDS):** `postgresql://user:pass@your-db.region.rds.amazonaws.com:5432/dbname`

## Verification

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'logo';

-- Should return:
-- column_name | data_type
-- logo        | text
```

## Troubleshooting

### Error: "psql: command not found"
- Install PostgreSQL client tools
- Or use a GUI tool like pgAdmin

### Error: "could not connect to server"
- Check if database server is running
- Verify host, port, username, and password
- Check firewall settings

### Error: "permission denied"
- Ensure your database user has ALTER TABLE permissions
- You may need to run as database superuser

