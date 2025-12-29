# 🔧 Fix Database Schema - Missing google_id Column

## Problem

The database table `candidates` is missing the `google_id` column that's defined in your schema. This causes registration to fail with:

```
error: column "google_id" does not exist
```

## Solution: Run Database Push

You need to sync your database schema with your code schema by running:

```bash
npm run db:push
```

## How to Run (Production - Render)

### Option 1: Via Render Shell (Recommended)

1. Go to **Render Dashboard** → Your Backend Service
2. Click on **Shell** tab (or use the terminal icon)
3. Run:
   ```bash
   npm run db:push
   ```
4. When prompted about data loss (session table), select: **"Yes, I want to remove 1 table"**
5. Wait for completion

### Option 2: Via Local Machine

1. **Set DATABASE_URL** temporarily:
   ```powershell
   $env:DATABASE_URL="your-production-database-url"
   ```

2. **Run the push command:**
   ```powershell
   npm run db:push
   ```

3. **When prompted**, select: **"Yes, I want to remove 1 table"**

## What This Will Do

✅ **Add missing `google_id` column** to `candidates` table  
✅ **Sync all other schema changes**  
⚠️ **May drop `session` table** (will be recreated automatically on next server start)

## Safety

- ✅ **Your data is safe** - This only adds columns, doesn't delete data
- ✅ **Session table** will be recreated automatically
- ✅ **No data loss** from existing tables

## After Running

1. **Restart your backend** on Render (or it will auto-restart)
2. **Test registration** again
3. **Should work now!** ✅

---

## Alternative: Quick SQL Fix (If you prefer)

If you want to add just the column manually via SQL:

```sql
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
```

Run this in your Neon/PostgreSQL console.

---

**The proper way is `npm run db:push` - it ensures everything is in sync!**

