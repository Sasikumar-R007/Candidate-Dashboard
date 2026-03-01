# Exact pgAdmin Connection Steps for Your Databases

## Database 1: Dev (Neon) - Demo Database

### Connection Details:
- **Host:** `ep-muddy-meadow-a1qwjjyt-pooler.ap-southeast-1.aws.neon.tech`
- **Port:** `5432`
- **Database:** `neondb`
- **Username:** `neondb_owner`
- **Password:** `npg_U7ZcveYr8mNq`
- **SSL:** Required

### Steps to Connect:

1. **In pgAdmin, right-click "Servers" → Create → Server...**

2. **General Tab:**
   - **Name:** `Neon Dev (Demo)`

3. **Connection Tab:**
   - **Host name/address:** `ep-muddy-meadow-a1qwjjyt-pooler.ap-southeast-1.aws.neon.tech`
   - **Port:** `5432`
   - **Maintenance database:** `neondb`
   - **Username:** `neondb_owner`
   - **Password:** `npg_U7ZcveYr8mNq`
   - ✅ **Save password** (check this box)

4. **SSL Tab:**
   - **SSL mode:** Select `Require`

5. **Click "Save"**

---

## Database 2: Staging (Render)

### Connection Details:
- **Host:** `dpg-d6hbk0rh46gs73e43ov0-a.singapore-postgres.render.com`
- **Port:** `5432`
- **Database:** `staffos_staging`
- **Username:** `staffos_user`
- **Password:** `VElEYZPGVlE92wE6ekYnZqK4SmPLLUCR`
- **SSL:** Required

### Steps to Connect:

1. **In pgAdmin, right-click "Servers" → Create → Server...**

2. **General Tab:**
   - **Name:** `Render Staging`

3. **Connection Tab:**
   - **Host name/address:** `dpg-d6hbk0rh46gs73e43ov0-a.singapore-postgres.render.com`
   - **Port:** `5432`
   - **Maintenance database:** `staffos_staging`
   - **Username:** `staffos_user`
   - **Password:** `VElEYZPGVlE92wE6ekYnZqK4SmPLLUCR`
   - ✅ **Save password** (check this box)

4. **SSL Tab:**
   - **SSL mode:** Select `Require`

5. **Click "Save"**

---

## Running the Migration on Both Databases

### For Dev (Neon) Database:

1. **Expand in pgAdmin:**
   ```
   Servers
   └── Neon Dev (Demo)
       └── Databases
           └── neondb
   ```

2. **Right-click `neondb` → Query Tool**

3. **Paste and execute:**
   ```sql
   ALTER TABLE clients 
   ADD COLUMN IF NOT EXISTS logo TEXT;

   COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
   ```

4. **Verify:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'clients' AND column_name = 'logo';
   ```

### For Staging (Render) Database:

1. **Expand in pgAdmin:**
   ```
   Servers
   └── Render Staging
       └── Databases
           └── staffos_staging
   ```

2. **Right-click `staffos_staging` → Query Tool**

3. **Paste and execute:**
   ```sql
   ALTER TABLE clients 
   ADD COLUMN IF NOT EXISTS logo TEXT;

   COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
   ```

4. **Verify:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'clients' AND column_name = 'logo';
   ```

---

## Quick Copy-Paste SQL

Use this SQL for both databases:

```sql
-- Migration: Add logo column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

-- Add comment to column for documentation
COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';

-- Verification query
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'logo';
```

---

## Troubleshooting

### If connection fails:

1. **Check IP Whitelisting:**
   - Neon: Go to Neon Console → Your Project → Settings → IP Allowlist
   - Render: Check if your IP needs to be whitelisted

2. **Try SSL mode "Prefer" instead of "Require"** if "Require" doesn't work

3. **For Neon pooler connection:**
   - The host has "-pooler" in it, which is correct for connection pooling
   - If it doesn't work, try removing "-pooler" from the hostname

4. **Connection timeout:**
   - Make sure your firewall allows outbound connections on port 5432
   - Try connecting from a different network if possible

---

## After Migration

Once both migrations are complete:
- ✅ Dev database has `logo` column
- ✅ Staging database has `logo` column
- ✅ You can now deploy your code changes
- ✅ Logo upload feature will work

