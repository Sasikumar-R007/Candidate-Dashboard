# Quick Migration Steps: Neon → Render Database

## ⚠️ Important Answer to Your Question

**Q: Will tables/migrations be done automatically when creating Render DB?**  
**A: NO!** Render database is completely empty. You MUST run migrations manually.

---

## 🚀 Quick Start (5 Steps)

### Step 1: Create Render PostgreSQL Database
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - Name: `staffos-production-db`
   - Database: `staffos_production`
   - User: `staffos_user`
   - Region: Same as your backend
   - Plan: Starter ($7/month) or Free (testing)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (you'll need it!)

### Step 2: Check Environment Variables
1. Go to Render Dashboard → Your Backend Service
2. Click **"Environment"** tab
3. Verify these are set:
   - ✅ `DATABASE_URL` (will update to Render)
   - ✅ `FRONTEND_URL`
   - ✅ `SESSION_SECRET`
   - ✅ `GOOGLE_CLIENT_ID` (if using OAuth)
   - ✅ `GOOGLE_CLIENT_SECRET` (if using OAuth)
   - ✅ `RESEND_API_KEY` (if using email)
   - ✅ `NODE_ENV` = `production`

### Step 3: Create Tables (Run Migrations)

**Option A: Using db:push (Easiest)**
```powershell
# Set Render database URL
$env:DATABASE_URL="postgresql://username:password@render-host:port/database"

# Run from project root
cd Candidate-Dashboard
npm run db:push
```

**Option B: Using SQL Scripts**
1. Connect to Render database (pgAdmin, DBeaver, or Render web interface)
2. Run migration SQL files:
   - `server/migrations/add_jd_fields.sql`
   - `server/migrations/add_client_logo.sql`
3. Or run all SQL from `shared/schema.ts` manually

### Step 4: Migrate Data (Optional - if you want existing data)

**Export from Neon:**
- Use Neon Console SQL Editor
- Export data table by table
- Or use pg_dump if you have access

**Import to Render:**
- Connect to Render database
- Run INSERT statements
- Or use pgAdmin Restore feature

### Step 5: Update Backend Connection
1. Go to Render Dashboard → Your Backend
2. **Environment** tab
3. Find `DATABASE_URL`
4. Replace Neon URL with Render Internal Database URL
5. Click **"Save Changes"**
6. Backend will auto-redeploy

---

## ✅ Verification

After migration:
1. Check backend logs (should show no errors)
2. Test login functionality
3. Verify data is accessible
4. Test creating new records

---

## 📋 Complete Checklist

- [ ] Created Render PostgreSQL database
- [ ] Saved Internal Database URL
- [ ] Checked all environment variables
- [ ] Added missing environment variables
- [ ] Ran `npm run db:push` or SQL migrations
- [ ] Verified tables were created
- [ ] (Optional) Migrated data from Neon
- [ ] Updated DATABASE_URL in backend
- [ ] Backend redeployed successfully
- [ ] Tested application - everything works

---

## 🔍 Detailed Guides

For complete step-by-step instructions, see:
- `MIGRATE_NEON_TO_RENDER_DB.md` - Full migration guide
- `ENV_VARS_CHECKLIST.md` - Environment variables reference

---

## ⚠️ Important Notes

1. **Render DB is Empty:** Must run migrations first
2. **Use Internal URL:** For Render services, use Internal Database URL
3. **Backup First:** Always backup Neon data before migration
4. **Test First:** Consider testing on staging environment first
5. **Keep Neon:** Don't delete Neon until migration is verified

---

**Time Estimate:** 30-60 minutes  
**Difficulty:** Medium  
**Downtime:** 5-10 minutes (during DATABASE_URL update)
