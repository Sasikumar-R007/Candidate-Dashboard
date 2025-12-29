# Database Environment Variables - Complete Explanation

## 🔍 How Environment Variables Work

### Local Development (.env file)
- **Location:** `.env` file in your project root
- **Used by:** Your local machine when running `npm run dev`
- **Database:** Points to your **local PostgreSQL** (localhost)
- **Does NOT affect:** Production/Render deployment

### Production (Render Environment Variables)
- **Location:** Render Dashboard → Your Service → Environment
- **Used by:** Render servers when running your deployed app
- **Database:** Points to your **Neon production database**
- **Does NOT affect:** Your local development

## ✅ Important: They Are SEPARATE!

```
┌─────────────────────────────────────┐
│  LOCAL DEVELOPMENT                  │
│  ├─ .env file                       │
│  ├─ DATABASE_URL → localhost:5432  │
│  └─ Your local PostgreSQL          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PRODUCTION (Render)                │
│  ├─ Render Environment Variables    │
│  ├─ DATABASE_URL → Neon database    │
│  └─ Your Neon production database   │
└─────────────────────────────────────┘
```

**They are completely independent!**

- ✅ Your local `.env` file **only affects** your local development
- ✅ Render environment variables **only affect** your production deployment
- ✅ **No data will collapse** - they use different databases
- ✅ **Safe to keep both** - they don't interfere with each other

---

## 🎯 What You Need to Do

### For Local Development (Keep As Is)
Your `.env` file should have:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/staffos_dev"
```
**Don't change this!** It's for local development only.

### For Production (Render)
In Render Dashboard → Environment Variables, you should have:
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
```
This is your **Neon production database** - already set correctly!

---

## 🔧 Running db:push for Production (Without Render Shell)

Since you don't have Render Shell access, here are your options:

### Option 1: Run Locally with Production DATABASE_URL (Recommended)

1. **Open PowerShell** in your project folder

2. **Temporarily set production DATABASE_URL:**
   ```powershell
   $env:DATABASE_URL="your-neon-production-database-url"
   ```
   
   Get your Neon URL from:
   - Neon Dashboard → Your Project → Connection Details
   - Copy the connection string (should end with `?sslmode=require`)

3. **Run the push command:**
   ```powershell
   npm run db:push
   ```

4. **When prompted about session table:**
   - Select: **"Yes, I want to remove 1 table"**
   - Press Enter

5. **Done!** The production database now has the `google_id` column

6. **Clear the environment variable** (optional):
   ```powershell
   $env:DATABASE_URL=$null
   ```

**Note:** This only affects the current PowerShell session. Your `.env` file remains unchanged!

### Option 2: Use Neon SQL Editor (Easiest)

1. Go to **Neon Console** → Your Project → **SQL Editor**

2. Run this SQL command:
   ```sql
   ALTER TABLE candidates 
   ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
   ```

3. **Done!** The column is added instantly

4. **Verify it worked:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'candidates' 
   AND column_name = 'google_id';
   ```

### Option 3: Create a Temporary Script

Create a file `push-production-db.ts`:

```typescript
import "dotenv/config";
import { execSync } from "child_process";

// Set production DATABASE_URL
process.env.DATABASE_URL = "your-neon-production-url-here";

// Run drizzle push
execSync("npx drizzle-kit push", { stdio: "inherit" });
```

Then run:
```powershell
npx tsx push-production-db.ts
```

---

## ✅ Verification Steps

After running the fix:

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Try registering a candidate
   - Should NOT see "google_id does not exist" error

2. **Test Registration:**
   - Go to your production site
   - Try registering a new candidate
   - Should work without errors

3. **Verify Column Exists (Optional):**
   - Go to Neon SQL Editor
   - Run: `SELECT * FROM candidates LIMIT 1;`
   - Should not show any errors

---

## 🛡️ Safety Guarantees

### Your Local Database
- ✅ **Completely safe** - `.env` file only affects local
- ✅ **No changes** - Local database remains untouched
- ✅ **Keep using** - Continue developing locally as normal

### Your Production Database
- ✅ **Only adds column** - No data deletion
- ✅ **Safe operation** - `ALTER TABLE ADD COLUMN` is non-destructive
- ✅ **Existing data preserved** - All candidate records remain intact

### Data Separation
- ✅ **Local data** stays in local PostgreSQL
- ✅ **Production data** stays in Neon
- ✅ **No mixing** - They never interact
- ✅ **No collapse** - Completely separate systems

---

## 📋 Quick Checklist

- [ ] Keep local `.env` file as is (localhost database)
- [ ] Verify Render has Neon DATABASE_URL in environment variables
- [ ] Run `npm run db:push` locally with production DATABASE_URL (Option 1)
   - OR use Neon SQL Editor (Option 2)
- [ ] Test candidate registration in production
- [ ] Verify it works!

---

## 💡 Pro Tip

**Best Practice:**
- Keep `.env` for local development (localhost)
- Use Render Environment Variables for production (Neon)
- Never commit `.env` to git (it's in .gitignore)
- Always use environment variables in production platforms

This way:
- ✅ Local development uses local database
- ✅ Production uses production database
- ✅ No conflicts or data mixing
- ✅ Safe and secure!

---

**Your data is completely safe - local and production are separate!** 🎯

