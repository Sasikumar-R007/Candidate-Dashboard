# pgAdmin Connection Guide for Neon/Render Databases

## Step-by-Step: Connect pgAdmin to Your Database

### Part 1: Get Your Database Connection Details

#### For Neon Database:
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click on your database
4. Look for **"Connection Details"** or **"Connection String"**
5. You'll see something like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

#### For Render Database:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your PostgreSQL database
3. Click on **"Connections"** or **"Info"** tab
4. Copy the **"Internal Database URL"** or **"External Connection String"**
5. Format will be:
   ```
   postgresql://username:password@hostname:port/dbname
   ```

### Part 2: Parse Connection Details

From your connection string, extract:
- **Host/Server:** The hostname (e.g., `ep-xxx-xxx.region.aws.neon.tech`)
- **Port:** Usually `5432` (or check your connection string)
- **Database:** The database name
- **Username:** Your database username
- **Password:** Your database password

**Example Neon connection string breakdown:**
```
postgresql://neondb_owner:password123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```
- Host: `ep-cool-darkness-123456.us-east-2.aws.neon.tech`
- Port: `5432` (default, not shown)
- Database: `neondb`
- Username: `neondb_owner`
- Password: `password123`

### Part 3: Connect pgAdmin to Your Database

1. **Open pgAdmin 4**

2. **Expand "Servers" in the left sidebar**
   - Right-click on "Servers"
   - Select **"Create" → "Server..."**

3. **Fill in the "General" tab:**
   - **Name:** Give it a friendly name (e.g., "Neon Production" or "Render Staging")

4. **Go to "Connection" tab and fill in:**
   - **Host name/address:** Your database host (from step 2)
   - **Port:** `5432` (or your specific port)
   - **Maintenance database:** Your database name
   - **Username:** Your database username
   - **Password:** Your database password
   - **Save password:** ✅ Check this box (optional but convenient)

5. **Go to "SSL" tab (IMPORTANT for Neon/Render):**
   - **SSL mode:** Select **"Require"** or **"Prefer"**
   - This is required for cloud databases

6. **Click "Save"**

7. **If connection succeeds:**
   - You'll see your server appear in the left sidebar
   - Expand it to see your database

### Part 4: Run the Migration SQL

1. **In pgAdmin, expand your server:**
   ```
   Servers
   └── Your Server Name
       └── Databases
           └── Your Database Name
   ```

2. **Right-click on your database name**
   - Select **"Query Tool"**

3. **A new SQL query window will open**

4. **Copy and paste this SQL:**
   ```sql
   -- Migration: Add logo column to clients table
   ALTER TABLE clients 
   ADD COLUMN IF NOT EXISTS logo TEXT;

   -- Add comment to column for documentation
   COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
   ```

5. **Click the "Execute" button** (or press F5)

6. **You should see:**
   ```
   Query returned successfully with no result in XX ms.
   ```

7. **Verify the migration worked:**
   - Run this query:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'clients' AND column_name = 'logo';
   ```
   - You should see a row with `logo` and `text`

### Troubleshooting Connection Issues

#### Issue: "Connection timeout" or "Could not connect"
**Solutions:**
- Check if your IP is whitelisted in Neon/Render
- For Render: Use "Internal Database URL" if connecting from Render services
- For Neon: Check if you need to allow your IP in Neon settings
- Try using "Prefer" instead of "Require" for SSL mode

#### Issue: "SSL required"
**Solution:**
- Make sure SSL mode is set to "Require" or "Prefer" in the SSL tab
- Cloud databases (Neon, Render) require SSL

#### Issue: "Authentication failed"
**Solutions:**
- Double-check username and password
- Make sure you're using the correct database user
- Some databases have different users for different purposes

#### Issue: "Database does not exist"
**Solution:**
- Verify the database name in your connection string
- Check the "Maintenance database" field matches

### Alternative: Using Query Tool Directly

If you can't create a server connection, you can also:

1. **Use pgAdmin's "Query Tool" with connection string:**
   - In pgAdmin, go to **Tools → Query Tool**
   - But this method is less convenient

2. **Use online SQL editor:**
   - Some cloud providers offer web-based SQL editors
   - Check Neon Console or Render Dashboard for "SQL Editor" or "Query" option

### Quick Reference: Connection Settings Summary

```
General Tab:
  Name: [Your choice - e.g., "Production DB"]

Connection Tab:
  Host: [from connection string]
  Port: 5432
  Database: [from connection string]
  Username: [from connection string]
  Password: [from connection string]
  Save password: ✅

SSL Tab:
  SSL mode: Require (or Prefer)
```

### After Successful Migration

Once the migration is complete:
1. ✅ The `logo` column is added to `clients` table
2. ✅ You can now deploy your code changes
3. ✅ Logo uploads will work in the Client Details modal

