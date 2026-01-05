# Database Migration Instructions

## Adding JD File and Text Fields to Requirements Table

To fix the error "column jd_file does not exist", you need to run the following SQL migration:

### Option 1: Using psql (Recommended)
```bash
# Connect to your PostgreSQL database
psql -d your_database_name -f server/migrations/add_jd_fields.sql
```

### Option 2: Using Database GUI Tool
1. Open your database management tool (pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Run the SQL script from `server/migrations/add_jd_fields.sql`:
   ```sql
   -- Add jd_file column (text field for JD file URL)
   ALTER TABLE requirements 
   ADD COLUMN IF NOT EXISTS jd_file TEXT;

   -- Add jd_text column (text field for JD text content)
   ALTER TABLE requirements 
   ADD COLUMN IF NOT EXISTS jd_text TEXT;
   ```

### Option 3: Direct SQL Execution
If you're using a connection string, you can execute:
```sql
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_file TEXT;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_text TEXT;
```

After running the migration, restart your server and the JD upload functionality should work correctly.

