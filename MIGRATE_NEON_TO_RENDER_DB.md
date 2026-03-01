# Complete Guide: Migrate from Neon to Render PostgreSQL

## Overview

This guide will help you:
1. ✅ Create a new PostgreSQL database in Render
2. ✅ Migrate all data from Neon to Render
3. ✅ Connect your Render backend to the new Render database
4. ✅ Verify all environment variables
5. ✅ Run migrations to create tables

---

## ⚠️ Important: Render Database is Empty

**When you create a Render PostgreSQL database, it's completely empty - no tables exist!**

You need to:
1. Run migrations to create all tables
2. Migrate data from Neon to Render (if you want to keep existing data)

---

## Step 1: Create PostgreSQL Database in Render

### 1.1 Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Log in to your account
3. Click **"New +"** button (top right)
4. Select **"PostgreSQL"**

### 1.2 Configure Database
Fill in the form:

- **Name:** `staffos-production-db` (or your preferred name)
- **Database:** `staffos_production` (or your preferred database name)
- **User:** `staffos_user` (or your preferred username)
- **Region:** Choose closest to your backend (e.g., `Singapore` or `Oregon`)
- **PostgreSQL Version:** `16` (or latest available)
- **Plan:** 
  - **Starter** ($7/month) - Recommended for production
  - **Free** - For testing only (sleeps after inactivity)

### 1.3 Create Database
- Click **"Create Database"**
- Wait for database to be provisioned (2-3 minutes)

### 1.4 Get Connection Details
Once created:
1. Click on your database
2. Go to **"Info"** or **"Connections"** tab
3. Copy the **"Internal Database URL"** (for Render services)
4. Also note the **"External Connection String"** (for local tools)

**Connection String Format:**
```
postgresql://username:password@hostname:port/database
```

**Save these details - you'll need them!**

---

## Step 2: Check Current Environment Variables in Render Backend

### 2.1 Access Your Backend Service
1. Go to Render Dashboard
2. Click on your backend service (`staffos-backend`)
3. Go to **"Environment"** tab

### 2.2 Required Environment Variables Checklist

Verify these are set:

#### ✅ Required Variables:

1. **DATABASE_URL**
   - Currently: Neon connection string
   - Will update: Render database connection string

2. **FRONTEND_URL**
   - Should be: Your frontend URL (e.g., `https://yourdomain.com`)
   - Format: `https://yourdomain.com` (NO trailing slash)

3. **NODE_ENV**
   - Should be: `production`

4. **SESSION_SECRET**
   - Should be: A long random string (Render can generate this)

5. **GOOGLE_CLIENT_ID** (if using Google OAuth)
   - Your Google OAuth Client ID

6. **GOOGLE_CLIENT_SECRET** (if using Google OAuth)
   - Your Google OAuth Client Secret

7. **GOOGLE_CALLBACK_URL** (if using Google OAuth)
   - Format: `https://your-backend-url.onrender.com/api/auth/google/callback`

8. **RESEND_API_KEY** (if using email)
   - Your Resend API key

9. **NODE_VERSION**
   - Should be: `20.10.0` (or your Node version)

### 2.3 Missing Variables?
If any are missing, add them now in the Environment tab.

---

## Step 3: Run Migrations to Create Tables

**Render database is empty - you need to create all tables first!**

### Option A: Using db:push (Recommended)

1. **Set DATABASE_URL temporarily:**
   ```powershell
   # Get the Internal Database URL from Render dashboard
   $env:DATABASE_URL="postgresql://username:password@hostname:port/database"
   ```

2. **Run migration:**
   ```powershell
   cd Candidate-Dashboard
   npm run db:push
   ```

   This will create all tables based on your schema.

### Option B: Using SQL Scripts

If `db:push` doesn't work, you can run SQL manually:

1. **Connect to Render database** (via pgAdmin, DBeaver, or Render's web interface)
2. **Run all migration files** in order:
   - `server/migrations/add_jd_fields.sql`
   - `server/migrations/add_client_logo.sql`
   - Any other migration files

3. **Or use Drizzle to generate migration:**
   ```powershell
   npm run drizzle-kit generate
   npm run drizzle-kit migrate
   ```

### Option C: Using Render Shell (if available)

1. Go to Render Dashboard → Your Database
2. Look for **"Shell"** or **"Query"** option
3. Connect and run SQL commands

---

## Step 4: Migrate Data from Neon to Render

### 4.1 Export Data from Neon

**Option A: Using pg_dump (if you have access)**
```bash
pg_dump "postgresql://neondb_owner:password@ep-muddy-meadow-a1qwjjyt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" > neon_backup.sql
```

**Option B: Using Neon Console**
1. Go to Neon Console
2. Use SQL Editor to export data table by table
3. Or use Neon's export feature if available

**Option C: Using Application-Level Export**
- Create API endpoints to export data
- Or use database tools to export

### 4.2 Import Data to Render

**Option A: Using psql**
```bash
psql "postgresql://username:password@render-host:port/database" < neon_backup.sql
```

**Option B: Using pgAdmin**
1. Connect to Render database in pgAdmin
2. Right-click database → **"Restore"**
3. Select your backup file

**Option C: Manual Import via SQL**
- Connect to Render database
- Run INSERT statements for each table

### 4.3 Verify Data Migration

After importing, verify:
```sql
-- Check table counts
SELECT 
  'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'candidates', COUNT(*) FROM candidates
UNION ALL
SELECT 'requirements', COUNT(*) FROM requirements;
-- Add other tables as needed
```

---

## Step 5: Update Backend to Use Render Database

### 5.1 Update DATABASE_URL in Render Backend

1. Go to Render Dashboard
2. Click on your backend service (`staffos-backend`)
3. Go to **"Environment"** tab
4. Find **DATABASE_URL**
5. Click **"Edit"**
6. Replace Neon URL with Render Internal Database URL:
   ```
   postgresql://username:password@render-host:port/database
   ```
7. Click **"Save Changes"**

### 5.2 Backend Will Redeploy

- Render automatically redeploys when environment variables change
- Wait for deployment to complete (2-5 minutes)
- Check deployment logs for any errors

---

## Step 6: Verify Everything Works

### 6.1 Check Backend Health

1. Visit your backend health endpoint:
   ```
   https://your-backend.onrender.com/api/health
   ```
2. Should return success status

### 6.2 Test Database Connection

1. Try logging in to your application
2. Check if data loads correctly
3. Test creating new records
4. Verify all features work

### 6.3 Check Backend Logs

1. Go to Render Dashboard → Your Backend
2. Click **"Logs"** tab
3. Look for any database connection errors
4. Verify no errors related to missing tables

---

## Step 7: Update Local Development (Optional)

If you want to use Render database for local development:

1. Update your local `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@render-host:port/database
   ```

2. **Note:** Use **External Connection String** for local access
3. Make sure your IP is whitelisted in Render (if required)

---

## Environment Variables Summary

### Required for Production Backend:

```env
NODE_ENV=production
NODE_VERSION=20.10.0
DATABASE_URL=postgresql://username:password@render-host:port/database
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
RESEND_API_KEY=your-resend-api-key
```

### Optional Variables:

- `PORT` - Usually auto-set by Render
- `BACKEND_URL` - If needed for callbacks
- Any other service-specific keys

---

## Troubleshooting

### Issue: "Table does not exist"
**Solution:** Run migrations first (Step 3)

### Issue: "Connection refused"
**Solution:** 
- Check if using Internal Database URL (for Render services)
- Verify database is running
- Check firewall/network settings

### Issue: "SSL required"
**Solution:** Render databases require SSL - your code should handle this automatically

### Issue: "Authentication failed"
**Solution:**
- Verify username and password
- Check if using correct connection string
- Ensure database user has proper permissions

### Issue: "Data not showing"
**Solution:**
- Verify data migration completed successfully
- Check if tables have data:
  ```sql
  SELECT COUNT(*) FROM clients;
  ```

---

## Migration Checklist

- [ ] Created Render PostgreSQL database
- [ ] Saved connection details
- [ ] Checked all environment variables in backend
- [ ] Added missing environment variables
- [ ] Ran migrations to create tables
- [ ] Exported data from Neon
- [ ] Imported data to Render
- [ ] Verified data migration
- [ ] Updated DATABASE_URL in Render backend
- [ ] Backend redeployed successfully
- [ ] Tested application functionality
- [ ] Verified all features work
- [ ] Checked backend logs for errors

---

## Important Notes

1. **Backup First:** Always backup Neon data before migration
2. **Test Environment:** Consider testing migration on staging first
3. **Downtime:** Plan for brief downtime during migration
4. **Rollback Plan:** Keep Neon database until migration is verified
5. **Monitoring:** Watch backend logs closely after migration

---

## After Migration

Once everything is working:
1. ✅ Monitor application for 24-48 hours
2. ✅ Verify all features work correctly
3. ✅ Check database performance
4. ✅ Update documentation
5. ✅ Consider keeping Neon as backup for a few days
6. ✅ Then decommission Neon database (if no longer needed)

---

## Quick Reference

### Render Database Connection:
- **Internal URL:** For Render services (backend)
- **External URL:** For local tools (pgAdmin, etc.)

### Migration Commands:
```powershell
# Set Render database URL
$env:DATABASE_URL="postgresql://user:pass@host:port/db"

# Push schema (creates tables)
npm run db:push

# Or generate and run migrations
npm run drizzle-kit generate
npm run drizzle-kit migrate
```

---

**Last Updated:** 2025  
**Status:** Ready for Migration

