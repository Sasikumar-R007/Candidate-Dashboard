# Neon Database Backup & Migration Guide

## 📦 Part 1: Backup Neon Database

### Option 1: Using Neon Dashboard (Easiest)

1. **Go to Neon Dashboard**
   - Visit: https://console.neon.tech
   - Login to your account

2. **Select Your Project**
   - Click on your project (the one with your 700 profiles)

3. **Create a Branch (Snapshot)**
   - Click on "Branches" in the left sidebar
   - Click "Create Branch"
   - Name it: `backup-before-migration-YYYY-MM-DD` (e.g., `backup-before-migration-2024-01-15`)
   - This creates a point-in-time snapshot of your database
   - ✅ **This is your backup!**

4. **Alternative: Export Data**
   - Go to "SQL Editor" in Neon dashboard
   - Run this command to export all candidates:
   ```sql
   COPY (SELECT * FROM candidates) TO STDOUT WITH CSV HEADER;
   ```
   - Copy the results and save to a file

### Option 2: Using pg_dump (Command Line)

If you have `pg_dump` installed locally:

```bash
# Get your connection string from Neon dashboard
# Format: postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Run backup command
pg_dump "your_neon_connection_string" > backup_before_migration.sql

# Or with specific table
pg_dump "your_neon_connection_string" -t candidates > candidates_backup.sql
```

### Option 3: Using Neon CLI (If Installed)

```bash
# Install Neon CLI (if not installed)
npm install -g neonctl

# Login
neonctl auth

# Create backup branch
neonctl branches create --name backup-before-migration-2024-01-15
```

---

## 🚀 Part 2: Where to Run Migration Command

### **Option A: Run in Cursor Terminal (Recommended for Testing)**

**Best for**: Testing on local database first, or if you have direct server access

1. **Open Terminal in Cursor**
   - Press `` Ctrl + ` `` (backtick) or go to `Terminal` → `New Terminal`

2. **Navigate to Project Directory**
   ```bash
   cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
   ```

3. **Set Environment Variable**
   ```bash
   # For Windows PowerShell
   $env:DATABASE_URL="your_neon_connection_string"
   
   # Or create/update .env file
   # Add: DATABASE_URL=your_neon_connection_string
   ```

4. **Run Migration**
   ```bash
   npm run migrate-profiles
   ```

### **Option B: Run on Your Live Server (Recommended for Production)**

**Best for**: Running on the actual production server

1. **SSH into Your Server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Navigate to Project Directory**
   ```bash
   cd /path/to/your/project/Candidate-Dashboard
   ```

3. **Ensure .env is Set**
   ```bash
   # Check .env file has DATABASE_URL
   cat .env | grep DATABASE_URL
   ```

4. **Run Migration**
   ```bash
   npm run migrate-profiles
   ```

### **Option C: Run via Deployment Platform (Vercel/Railway/etc.)**

If your app is deployed on a platform:

1. **Use Platform's Terminal/Console**
   - Vercel: Go to project → Settings → Functions → Terminal
   - Railway: Go to project → Deployments → Open Terminal
   - Render: Go to project → Shell

2. **Run Migration Command**
   ```bash
   npm run migrate-profiles
   ```

---

## 🔐 Getting Your Neon Connection String

1. **Go to Neon Dashboard**: https://console.neon.tech
2. **Select Your Project**
3. **Go to "Connection Details"** or **"Settings"**
4. **Copy Connection String**
   - Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
5. **Add to .env file**:
   ```
   DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

---

## ✅ Recommended Approach for Live Website

### Step-by-Step:

1. **Backup First** (Neon Dashboard)
   - Create a branch: `backup-before-migration-2024-01-15`
   - ✅ This is your safety net

2. **Test Locally First** (Optional but Recommended)
   - Run migration on a test database or local copy
   - Verify it works correctly

3. **Run on Live Server**
   - SSH into your production server
   - Or use your deployment platform's terminal
   - Run: `npm run migrate-profiles`

4. **Monitor Progress**
   - Watch the console output
   - Check for any errors

5. **Verify Results**
   - Check `migration-report.json`
   - Spot check profiles in your application

---

## 🛡️ Safety Checklist

Before running migration on live database:

- [ ] ✅ Backup created in Neon (branch or export)
- [ ] ✅ DATABASE_URL is correct in .env
- [ ] ✅ You're connected to the right database
- [ ] ✅ You have access to restore backup if needed
- [ ] ✅ You're running during low-traffic period (optional)

---

## 🔄 If Something Goes Wrong

### Restore from Neon Branch:

1. **Go to Neon Dashboard**
2. **Go to Branches**
3. **Find your backup branch**
4. **Click "Promote to Primary"** or **"Restore"**
5. This will restore your database to the backup state

### Or Restore from SQL Backup:

```bash
# If you exported SQL
psql "your_neon_connection_string" < backup_before_migration.sql
```

---

## 📝 Quick Command Reference

```bash
# 1. Set environment (Windows PowerShell)
$env:DATABASE_URL="your_neon_connection_string"

# 2. Navigate to project
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"

# 3. Run migration
npm run migrate-profiles

# 4. Check results
cat migration-report.json
```

---

## 🆘 Troubleshooting

### "DATABASE_URL not set"
- Check `.env` file exists and has `DATABASE_URL`
- Or set it in terminal: `$env:DATABASE_URL="..."`

### "Connection refused"
- Check your Neon connection string is correct
- Verify database is running in Neon dashboard
- Check firewall/network settings

### "Permission denied"
- Ensure you have write access to the database
- Check your Neon user has proper permissions

---

**Need Help?** Check the main `MIGRATION_GUIDE.md` for more details.

