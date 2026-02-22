# 🚀 Run Migration - Step by Step Guide

## Your Setup
- **Frontend**: Vercel
- **Backend**: Render  
- **Database**: Neon (with 700 profiles)
- **Backup**: ✅ Created branch in Neon

---

## 📋 Step-by-Step Instructions

### Step 1: Get Your Neon Connection String

1. **Go to Neon Dashboard**
   - Visit: https://console.neon.tech
   - Login and select your project

2. **Get Connection String**
   - Click on your project
   - Go to **"Connection Details"** or **"Settings"**
   - Copy the connection string
   - Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

3. **Important**: Make sure you're copying the connection string for the **PRIMARY branch** (the one with your 700 profiles), NOT the backup branch!

---

### Step 2: Update Your Local .env File

1. **Open your `.env` file** in Cursor
   - Location: `Candidate-Dashboard/.env`

2. **Find or Add DATABASE_URL**
   ```env
   DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

3. **Replace with your actual Neon connection string**
   - Paste the connection string you copied from Neon
   - Make sure it ends with `?sslmode=require`

4. **Save the file** (Ctrl+S)

---

### Step 3: Verify .env File

Your `.env` file should look something like this:

```env
DATABASE_URL=postgresql://neondb_owner:abc123xyz@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=development
# ... other variables
```

**Important**: 
- ✅ Make sure `DATABASE_URL` points to your **live Neon database** (with 700 profiles)
- ❌ Don't use the backup branch connection string
- ✅ Connection string should end with `?sslmode=require`

---

### Step 4: Open Terminal in Cursor

1. **Open Terminal**
   - Press `` Ctrl + ` `` (backtick key, above Tab)
   - OR go to: `Terminal` → `New Terminal` in menu

2. **Verify you're in the right directory**
   ```bash
   pwd
   ```
   Should show: `C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard`

3. **If not, navigate there:**
   ```bash
   cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
   ```

---

### Step 5: Run the Migration

1. **Run the command:**
   ```bash
   npm run migrate-profiles
   ```

2. **What you'll see:**
   ```
   🚀 Starting Migration: Improve Existing Candidate Profiles
   
   📋 This script will:
      1. Extract names from email addresses for profiles missing names
      2. Re-parse resume files to extract better data (if files exist)
      3. Update profiles with improved information
   
   🔍 Fetching all candidates from database...
   📊 Found 700 candidates to process
   
   📦 Processing 70 batches of up to 10 candidates each...
   ```

3. **Wait for it to complete**
   - This will take 30-60 minutes for 700 profiles
   - You'll see progress for each candidate
   - Don't close the terminal!

---

### Step 6: Check Results

After migration completes, you'll see:

```
================================================================================
📊 MIGRATION SUMMARY
================================================================================
📋 Total candidates: 700
✅ Successfully processed: 700
🔄 Updated: 450
⏭️ Skipped (no updates needed): 250
❌ Errors: 0

📈 Improvements:
   • Names extracted from email: 320
   • Resumes re-parsed: 280
================================================================================

📄 Detailed report saved to: migration-report.json

🎉 Migration completed successfully!
```

---

### Step 7: Review the Report

1. **Open the report file:**
   - File: `migration-report.json` (in your project root)
   - Open it in Cursor to see detailed results

2. **Check what was updated:**
   - See which candidates got names extracted
   - See which resumes were re-parsed
   - Check for any errors

---

## ✅ Quick Checklist

Before running:
- [ ] ✅ Backup branch created in Neon
- [ ] ✅ `.env` file has correct `DATABASE_URL` (pointing to live Neon, not backup)
- [ ] ✅ Connection string ends with `?sslmode=require`
- [ ] ✅ Terminal is open in Cursor
- [ ] ✅ You're in the project directory

To run:
- [ ] ✅ Run: `npm run migrate-profiles`
- [ ] ✅ Wait for completion (30-60 minutes)
- [ ] ✅ Check `migration-report.json`

After running:
- [ ] ✅ Review summary statistics
- [ ] ✅ Spot check a few profiles in your application
- [ ] ✅ Verify everything works correctly

---

## 🆘 Troubleshooting

### "DATABASE_URL not found"
**Solution**: Make sure `.env` file exists and has `DATABASE_URL` set

### "Connection refused" or "Connection timeout"
**Solution**: 
- Check your Neon connection string is correct
- Make sure you're using the PRIMARY branch connection string (not backup)
- Verify database is running in Neon dashboard

### "Cannot find module"
**Solution**: 
```bash
npm install
```

### Script stops or errors
**Solution**: 
- Check `migration-report.json` for error details
- Most errors are non-critical (e.g., resume file not found)
- Script continues processing even if some candidates fail

---

## 🔄 If You Need to Restore

If something goes wrong:

1. **Go to Neon Dashboard**
2. **Go to Branches**
3. **Find your backup branch** (`backup-before-migration-...`)
4. **Click "Promote to Primary"** or **"Restore"**
5. Your database will be restored to the backup state

---

## 📝 Example .env File

Here's what your `.env` should look like:

```env
# Neon Database (Live - with 700 profiles)
DATABASE_URL=postgresql://neondb_owner:your_password@ep-xxxxx-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Development
NODE_ENV=development

# Other variables...
SESSION_SECRET=your-secret-here
FRONTEND_URL=https://your-app.vercel.app
```

**Important**: 
- Use the PRIMARY branch connection string (the one with your 700 profiles)
- Don't use the backup branch connection string for migration

---

## 🎯 Summary

1. ✅ Backup created in Neon (done!)
2. 📝 Update `.env` with Neon connection string (PRIMARY branch)
3. 🖥️ Open terminal in Cursor
4. 🚀 Run: `npm run migrate-profiles`
5. ⏳ Wait 30-60 minutes
6. ✅ Check results in `migration-report.json`

---

**Ready?** Just update your `.env` file and run the command! 🚀

