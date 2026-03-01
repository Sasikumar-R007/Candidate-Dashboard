# Using Neon's Web SQL Editor (Easiest Method!)

## Step-by-Step Guide

### Step 1: Access Neon Console
1. Go to: https://console.neon.tech
2. Log in with your Neon account
3. Select your project

### Step 2: Open SQL Editor
1. Click on your database (`neondb`)
2. Look for **"SQL Editor"** tab at the top
3. Click on it

### Step 3: Run Migration SQL
1. In the SQL editor, paste this:

```sql
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
```

2. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

3. You should see: ✅ "Success" or "Query executed successfully"

### Step 4: Verify Migration
Run this verification query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'logo';
```

Expected result: Should show one row with `logo` column.

---

## Advantages of Using Neon Web Editor

✅ No connection issues  
✅ No SSL configuration needed  
✅ Works directly in browser  
✅ No pgAdmin setup required  
✅ Instant access  

---

## For Render Database

Unfortunately, Render doesn't have a built-in SQL editor like Neon.

**Options for Render:**

1. **Use pgAdmin with Advanced tab** (find SSL settings there)
2. **Use a different database client** (DBeaver, Azure Data Studio)
3. **Use command line** (if you have access)
4. **Use Render's connection info** to connect via another tool

---

## Complete Migration Checklist

- [ ] Dev (Neon): Run migration via Neon Web SQL Editor ✅
- [ ] Staging (Render): Run migration via pgAdmin or alternative tool
- [ ] Verify both databases have `logo` column
- [ ] Deploy code changes

