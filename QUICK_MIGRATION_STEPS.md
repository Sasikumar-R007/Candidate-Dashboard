# Quick Migration Steps

## 🚀 For Your Live Website (700 Profiles)

### Step 1: Backup Your Database
**CRITICAL**: Backup your database before running the migration!

```bash
# Example for PostgreSQL
pg_dump your_database > backup_before_migration.sql

# Or use your database management tool to create a backup
```

### Step 2: Ensure Environment is Set
Make sure your `.env` file has the correct `DATABASE_URL`:
```
DATABASE_URL=your_live_database_connection_string
```

### Step 3: Run the Migration
```bash
npm run migrate-profiles
```

### Step 4: Review Results
1. Check the console output for summary statistics
2. Review `migration-report.json` for detailed information
3. Spot check a few profiles in your application

### Step 5: Verify Everything Works
- ✅ Profiles show improved names
- ✅ Resume files still load correctly
- ✅ Search/filtering works
- ✅ No errors in application logs

---

## 📊 What Gets Updated

### Names
- Profiles with missing names → Extracted from email addresses
- Example: `john.doe@email.com` → Name becomes `John Doe`

### Resume Data
- Profiles with resume files → Re-parsed to extract:
  - Name, Phone, Designation, Experience
  - Skills, Location, Company, Education
  - LinkedIn, Portfolio, Website URLs

### Safety
- ✅ Only updates missing or "Not Available" fields
- ✅ Won't overwrite existing good data
- ✅ Safe to run multiple times

---

## ⏱️ Expected Time

For 700 profiles:
- **With resume files**: ~30-60 minutes (depends on file sizes)
- **Without resume files**: ~5-10 minutes (name extraction only)

---

## 🆘 If Something Goes Wrong

1. **Stop the script** (Ctrl+C)
2. **Check the migration report** for errors
3. **Restore from backup** if needed
4. **Review the detailed guide**: See `MIGRATION_GUIDE.md`

---

## ✅ Success Indicators

After migration, you should see:
- More profiles with proper names (not "Not Available")
- Better data extraction in profile details
- Improved search results
- Migration report showing updates made

---

**Need Help?** Check `MIGRATION_GUIDE.md` for detailed instructions.

