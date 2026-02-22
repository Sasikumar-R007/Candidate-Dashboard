# 🔴 CRITICAL: Production Database Migration Required

## Issue
The production database is missing the `jd_file` and `jd_text` columns in the `requirements` table, causing:
- `POST /api/client/submit-jd 500 (Internal Server Error)`
- Error: `column "jd_file" does not exist`

## ✅ Solution: Run Database Migration

You need to add these columns to your **PRODUCTION Neon database** (not local).

---

## Step-by-Step Migration Instructions

### Option 1: Using Neon Console (Easiest) ⭐ Recommended

1. **Go to Neon Console:**
   - Visit: https://console.neon.tech
   - Log in to your account

2. **Select Your Production Database:**
   - Click on your production project/database

3. **Open SQL Editor:**
   - Click on **"SQL Editor"** in the left sidebar
   - Or go to: **"Branches"** → Select your main branch → **"SQL Editor"**

4. **Run This SQL:**
   ```sql
   -- Add jd_file column (text field for JD file URL)
   ALTER TABLE requirements 
   ADD COLUMN IF NOT EXISTS jd_file TEXT;

   -- Add jd_text column (text field for JD text content)
   ALTER TABLE requirements 
   ADD COLUMN IF NOT EXISTS jd_text TEXT;
   ```

5. **Click "Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

6. **Verify Success:**
   - You should see: `Success. No rows returned`
   - Or run this to verify:
     ```sql
     SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_name = 'requirements' 
     AND column_name IN ('jd_file', 'jd_text');
     ```
   - Should return 2 rows showing both columns exist

---

### Option 2: Using psql Command Line

1. **Get Your Production DATABASE_URL:**
   - From Neon Console → Your Project → **"Connection Details"**
   - Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`)

2. **Run Migration:**
   ```bash
   # Set the DATABASE_URL
   export DATABASE_URL="your-production-neon-connection-string"

   # Run the migration SQL
   psql "$DATABASE_URL" -c "ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_file TEXT;"
   psql "$DATABASE_URL" -c "ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_text TEXT;"
   ```

   Or use the migration file:
   ```bash
   psql "$DATABASE_URL" -f Candidate-Dashboard/server/migrations/add_jd_fields.sql
   ```

---

### Option 3: Using Database GUI Tool (DBeaver, pgAdmin, etc.)

1. **Connect to Production Database:**
   - Use your Neon connection string
   - Host: `ep-xxxxx.neon.tech`
   - Database: Your database name
   - Username/Password: From Neon console

2. **Open SQL Query Window**

3. **Run This SQL:**
   ```sql
   ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_file TEXT;
   ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_text TEXT;
   ```

4. **Execute** (F5 or Run button)

---

## ✅ Verification

After running the migration, verify it worked:

```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'requirements' 
AND column_name IN ('jd_file', 'jd_text');
```

**Expected Result:**
```
 column_name | data_type | is_nullable
-------------+-----------+-------------
 jd_file     | text      | YES
 jd_text     | text      | YES
```

---

## 🚀 After Migration

1. **No need to restart Render backend** - It will automatically use the new columns
2. **Test JD Upload:**
   - Go to Client Dashboard → Submit JD
   - Upload a JD file or paste JD text
   - Should work without errors now

---

## ⚠️ Important Notes

- **This migration is SAFE** - Uses `IF NOT EXISTS` so it won't fail if columns already exist
- **No data loss** - Only adds new columns, doesn't modify existing data
- **Run on PRODUCTION database only** - Your local database already has these columns
- **One-time operation** - Only needs to be run once

---

## 🔍 Troubleshooting

### Error: "relation requirements does not exist"
- Check you're connected to the correct database
- Verify the table name is `requirements` (lowercase)

### Error: "permission denied"
- Ensure you're using the correct database user credentials
- Check your Neon project permissions

### Columns still missing after migration
- Verify you ran the SQL on the **production** database (not local)
- Check the connection string points to production
- Re-run the verification query

---

## 📞 Need Help?

If you encounter issues:
1. Check Neon Console → **"Logs"** for database errors
2. Verify your connection string is correct
3. Ensure you're connected to the production database branch

---

**Status:** ⚠️ **MUST RUN BEFORE JD UPLOAD WILL WORK IN PRODUCTION**

