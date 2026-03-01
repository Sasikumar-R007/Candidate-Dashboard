# Complete Render Database Migration Procedure

## 📋 Overview

This guide provides the **complete step-by-step procedure** to:
1. Create new Render PostgreSQL database
2. Initialize database with all tables (migrations)
3. Migrate data from Neon (optional)
4. Connect Render backend to new database
5. Verify all environment variables

---

## ⚠️ Critical Answer

**Q: Will tables/migrations be done automatically when creating Render DB?**  
**A: NO! Render database is completely EMPTY. You MUST run migrations manually.**

---

## Part 1: Create Render PostgreSQL Database

### Step 1.1: Access Render Dashboard
1. Go to: https://dashboard.render.com
2. Log in to your account

### Step 1.2: Create New Database
1. Click **"New +"** button (top right)
2. Select **"PostgreSQL"**

### Step 1.3: Configure Database
Fill in the form:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `staffos-production-db` | Your choice |
| **Database** | `staffos_production` | Database name |
| **User** | `staffos_user` | Username |
| **Region** | Same as backend | e.g., Singapore, Oregon |
| **PostgreSQL Version** | `16` (or latest) | Recommended |
| **Plan** | Starter ($7/mo) | Or Free for testing |

### Step 1.4: Create and Wait
1. Click **"Create Database"**
2. Wait 2-3 minutes for provisioning
3. Database will show as **"Available"** when ready

### Step 1.5: Get Connection Details
1. Click on your new database
2. Go to **"Info"** or **"Connections"** tab
3. **Copy the "Internal Database URL"** - you'll need this!
   - Format: `postgresql://user:pass@host:port/db`
4. Also note the **"External Connection String"** (for local tools)

**✅ Save these connection details!**

---

## Part 2: Check Environment Variables in Backend

### Step 2.1: Access Backend Service
1. In Render Dashboard, click on your backend service (`staffos-backend`)
2. Click **"Environment"** tab

### Step 2.2: Verify Required Variables

Check each variable exists and has correct value:

#### ✅ Core Variables (Required)
- [ ] `NODE_ENV` = `production`
- [ ] `NODE_VERSION` = `20.10.0` (or your version)
- [ ] `DATABASE_URL` = Currently Neon (will update to Render)
- [ ] `FRONTEND_URL` = `https://yourdomain.com` (no trailing slash)
- [ ] `SESSION_SECRET` = Long random string (Render can generate)

#### ✅ Authentication (If Using)
- [ ] `GOOGLE_CLIENT_ID` = Your Google OAuth Client ID
- [ ] `GOOGLE_CLIENT_SECRET` = Your Google OAuth Client Secret
- [ ] `GOOGLE_CALLBACK_URL` = `https://your-backend.onrender.com/api/auth/google/callback`

#### ✅ Email Service (If Using)
- [ ] `RESEND_API_KEY` = Your Resend API key

### Step 2.3: Add Missing Variables
1. Click **"Add Environment Variable"**
2. Enter Key and Value
3. Click **"Save Changes"**
4. Backend will redeploy automatically

**✅ All variables verified!**

---

## Part 3: Create Tables (Run Migrations)

**⚠️ IMPORTANT: Render database is EMPTY - no tables exist!**

### Option A: Using db:push (RECOMMENDED - Easiest)

1. **Set Render Database URL:**
   ```powershell
   # Get Internal Database URL from Render dashboard
   $env:DATABASE_URL="postgresql://staffos_user:password@dpg-xxxxx.render.com:5432/staffos_production"
   ```

2. **Run Migration:**
   ```powershell
   cd Candidate-Dashboard
   npm run db:push
   ```

3. **What it does:**
   - Reads your schema from `shared/schema.ts`
   - Creates ALL tables automatically
   - Adds all columns with correct types
   - Sets up indexes and constraints

4. **Verify:**
   ```sql
   -- Connect to Render DB and check tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

### Option B: Using SQL Scripts (Manual)

If `db:push` doesn't work:

1. **Connect to Render Database:**
   - Use pgAdmin, DBeaver, or Render's web interface
   - Use External Connection String

2. **Run Migration Files:**
   - `server/migrations/add_jd_fields.sql`
   - `server/migrations/add_client_logo.sql`
   - `server/migrations/add_chat_status_fields.sql`
   - `server/migrations/add_last_login_at.sql`
   - `server/migrations/chat_migration.sql`

3. **Create Base Tables:**
   - You'll need to create tables from `shared/schema.ts`
   - This is complex - **Option A is much easier!**

### Option C: Using Drizzle Migrations

```powershell
# Generate migrations
npm run drizzle-kit generate

# Run migrations
npm run drizzle-kit migrate
```

**✅ Tables created!**

---

## Part 4: Migrate Data from Neon (Optional)

**Only if you want to keep existing data!**

### Step 4.1: Export from Neon

**Method 1: Using Neon Console (Easiest)**
1. Go to https://console.neon.tech
2. Select your database
3. Use SQL Editor to export data:
   ```sql
   -- Export each table
   COPY (SELECT * FROM clients) TO STDOUT WITH CSV HEADER;
   -- Repeat for each table
   ```

**Method 2: Using pg_dump (If Available)**
```bash
pg_dump "postgresql://neondb_owner:pass@neon-host/neondb?sslmode=require" > backup.sql
```

**Method 3: Application-Level Export**
- Create temporary API endpoints to export data
- Or use database tools

### Step 4.2: Import to Render

**Method 1: Using psql**
```bash
psql "postgresql://user:pass@render-host:port/db" < backup.sql
```

**Method 2: Using pgAdmin**
1. Connect to Render database
2. Right-click database → **"Restore"**
3. Select backup file

**Method 3: Manual SQL**
- Connect to Render database
- Run INSERT statements for each table

### Step 4.3: Verify Data
```sql
-- Check data counts
SELECT 
  'clients' as table_name, COUNT(*) FROM clients
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'candidates', COUNT(*) FROM candidates
UNION ALL SELECT 'requirements', COUNT(*) FROM requirements;
```

**✅ Data migrated!**

---

## Part 5: Update Backend to Use Render Database

### Step 5.1: Update DATABASE_URL
1. Go to Render Dashboard → Your Backend Service
2. Click **"Environment"** tab
3. Find `DATABASE_URL`
4. Click **"Edit"** (pencil icon)
5. **Replace Neon URL with Render Internal Database URL:**
   ```
   OLD: postgresql://neondb_owner:pass@ep-xxx.neon.tech/neondb?sslmode=require
   NEW: postgresql://staffos_user:pass@dpg-xxx.render.com:5432/staffos_production
   ```
6. Click **"Save Changes"**

### Step 5.2: Wait for Redeploy
- Render automatically redeploys when env vars change
- Wait 2-5 minutes
- Check deployment status

### Step 5.3: Verify Connection
1. Go to **"Logs"** tab
2. Look for database connection messages
3. Should see: "Database connected" or similar
4. No errors about "connection refused" or "table does not exist"

**✅ Backend connected to Render database!**

---

## Part 6: Final Verification

### Step 6.1: Test Application
1. Visit your frontend
2. Try logging in
3. Check if data loads
4. Test creating new records
5. Verify all features work

### Step 6.2: Check Backend Logs
1. Render Dashboard → Backend → Logs
2. Look for errors
3. Verify no database errors

### Step 6.3: Verify Database
```sql
-- Connect to Render DB and verify
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return count of all your tables
```

**✅ Everything working!**

---

## Complete Checklist

### Database Setup
- [ ] Created Render PostgreSQL database
- [ ] Saved Internal Database URL
- [ ] Saved External Connection String

### Environment Variables
- [ ] Checked all required variables exist
- [ ] Added missing variables
- [ ] Verified all values are correct

### Migrations
- [ ] Ran `npm run db:push` or SQL migrations
- [ ] Verified all tables were created
- [ ] Checked table structure is correct

### Data Migration (Optional)
- [ ] Exported data from Neon
- [ ] Imported data to Render
- [ ] Verified data counts match

### Backend Connection
- [ ] Updated DATABASE_URL in Render backend
- [ ] Backend redeployed successfully
- [ ] No errors in backend logs

### Testing
- [ ] Application loads correctly
- [ ] Login works
- [ ] Data displays correctly
- [ ] Can create new records
- [ ] All features work

---

## Troubleshooting

### "Table does not exist"
**Solution:** Run migrations first (Part 3)

### "Connection refused"
**Solution:** 
- Use Internal Database URL (not External)
- Verify database is running
- Check connection string format

### "Authentication failed"
**Solution:**
- Verify username and password
- Check connection string is correct
- Ensure using Internal URL for Render services

### "SSL required"
**Solution:** Render handles SSL automatically - your code should work

### Backend won't start
**Solution:**
- Check backend logs for specific errors
- Verify DATABASE_URL format
- Ensure all required env vars are set

---

## Important Notes

1. **Render DB is Empty:** Must run migrations - nothing is automatic
2. **Use Internal URL:** For Render services, always use Internal Database URL
3. **Backup First:** Always backup Neon data before migration
4. **Test First:** Consider testing on staging before production
5. **Keep Neon:** Don't delete Neon database until migration is fully verified
6. **Monitor:** Watch logs closely for 24-48 hours after migration

---

## Quick Reference

### Render Database URLs
- **Internal:** For Render services (backend) - `postgresql://user:pass@internal-host:port/db`
- **External:** For local tools (pgAdmin) - `postgresql://user:pass@external-host:port/db`

### Migration Command
```powershell
$env:DATABASE_URL="postgresql://user:pass@render-host:port/db"
npm run db:push
```

### Environment Variables Summary
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@render-host:port/db
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=your-secret
GOOGLE_CLIENT_ID=your-id (if using)
GOOGLE_CLIENT_SECRET=your-secret (if using)
RESEND_API_KEY=your-key (if using)
```

---

## Time Estimate

- Database Creation: 5 minutes
- Environment Check: 10 minutes
- Running Migrations: 5-10 minutes
- Data Migration: 15-30 minutes (if needed)
- Backend Update: 5 minutes
- Testing: 15 minutes

**Total: 50-75 minutes**

---

**Status:** Ready to Migrate  
**Last Updated:** 2025

