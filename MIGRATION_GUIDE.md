# Migration Guide: Improve Existing Candidate Profiles

This guide explains how to run the migration script to improve existing candidate profiles in your database.

## 📋 What This Migration Does

The migration script (`migrate-existing-profiles.ts`) will:

1. **Extract Names from Email Addresses**
   - For profiles with missing names (null, empty, or "Not Available")
   - Derives names from email addresses (e.g., `john.doe@email.com` → `John Doe`)

2. **Re-parse Resume Files**
   - For profiles with existing resume files
   - Extracts better data from resumes (name, phone, designation, experience, skills, location, company, education, etc.)
   - Only updates fields that are currently missing or "Not Available"

3. **Update Profiles**
   - Updates database records with improved information
   - Only modifies fields that need improvement (safe operation)

## 🛡️ Safety Features

- ✅ **Non-destructive**: Only updates missing or "Not Available" fields
- ✅ **Error handling**: Continues processing even if individual candidates fail
- ✅ **Progress tracking**: Shows detailed progress and statistics
- ✅ **Report generation**: Creates a detailed JSON report of all changes
- ✅ **Batch processing**: Processes candidates in batches to avoid memory issues

## 📝 Prerequisites

1. **Database Connection**
   - Ensure `DATABASE_URL` is set in your `.env` file
   - The script connects to the same database as your application

2. **Resume Files** (Optional)
   - If you want to re-parse resumes, ensure resume files exist in:
     - `uploads/resumes/` (primary location)
     - `uploads/` (fallback location)
   - The script will skip candidates if resume files are not found (no error)

3. **Backup** (Recommended)
   - **IMPORTANT**: Backup your database before running the migration
   - While the script is safe, it's always good practice to have a backup

## 🚀 How to Run

### Option 1: Using npm script (Recommended)

```bash
npm run migrate-profiles
```

### Option 2: Using tsx directly

```bash
npx tsx server/scripts/migrate-existing-profiles.ts
```

### Option 3: Using Node.js (if compiled)

```bash
node dist/scripts/migrate-existing-profiles.js
```

## 📊 What to Expect

### During Execution

The script will:
1. Connect to your database
2. Fetch all candidates
3. Process them in batches (10 at a time)
4. Show progress for each candidate:
   - ✅ Updated - Profile was improved
   - ⏭️ Skipped - No updates needed
   - ❌ Error - An error occurred (logged in report)

### Example Output

```
🚀 Starting Migration: Improve Existing Candidate Profiles

📋 This script will:
   1. Extract names from email addresses for profiles missing names
   2. Re-parse resume files to extract better data (if files exist)
   3. Update profiles with improved information

🔍 Fetching all candidates from database...
📊 Found 700 candidates to process

📦 Processing 70 batches of up to 10 candidates each...

📦 Processing batch 1/70 (10 candidates)...
   [1/700] Processing john.doe@email.com... ✅ Updated
   [2/700] Processing jane.smith@email.com... ⏭️ Skipped
   ...

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

## 📄 Migration Report

After execution, a detailed report is saved to `migration-report.json` in your project root.

The report includes:
- **Summary**: Overall statistics
- **Details**: Per-candidate information about what was updated

### Report Structure

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "total": 700,
    "processed": 700,
    "updated": 450,
    "skipped": 250,
    "errors": 0,
    "nameExtractedFromEmail": 320,
    "resumeReparsed": 280
  },
  "details": [
    {
      "candidateId": "CAN001",
      "email": "john.doe@email.com",
      "action": "Extracted name from email: John Doe"
    },
    {
      "candidateId": "CAN002",
      "email": "jane.smith@email.com",
      "action": "Re-parsed resume: extracted name Jane Smith"
    }
  ]
}
```

## 🔍 Verifying Results

After running the migration:

1. **Check the Summary**
   - Review the console output for statistics
   - Check `migration-report.json` for detailed information

2. **Spot Check in Application**
   - Open a few profiles in your application
   - Verify that names and other fields are now populated
   - Check that resume files still load correctly

3. **Review Errors** (if any)
   - Check the report for candidates with errors
   - Most errors are non-critical (e.g., resume file not found)

## ⚠️ Troubleshooting

### Issue: "DATABASE_URL environment variable is not set"

**Solution**: Ensure your `.env` file contains:
```
DATABASE_URL=your_database_connection_string
```

### Issue: "Resume files not found"

**Solution**: This is normal if:
- Resume files were deleted
- Resume files are stored in a different location
- The script will skip these candidates (no error)

### Issue: "Too many errors"

**Solution**: 
- Check the migration report for specific error messages
- Most errors are non-critical and won't affect the overall migration
- If many errors occur, check database connectivity and file permissions

### Issue: Script runs slowly

**Solution**: This is normal for large databases (700+ candidates)
- The script processes candidates in batches
- Resume parsing can be slow for large files
- Allow the script to complete (it shows progress)

## 🔄 Running Multiple Times

The script is **safe to run multiple times**:
- It only updates fields that are missing or "Not Available"
- Won't overwrite existing data
- Useful if you add more candidates or resume files later

## 📞 Support

If you encounter issues:
1. Check the migration report (`migration-report.json`)
2. Review the console output for error messages
3. Ensure your database connection is working
4. Verify file permissions for resume files

## ✅ Post-Migration Checklist

- [ ] Review migration summary statistics
- [ ] Check migration report for any errors
- [ ] Spot check a few profiles in the application
- [ ] Verify resume files still load correctly
- [ ] Check that search/filtering works with updated data
- [ ] Monitor application for any issues

---

**Last Updated**: 2024-01-15
**Script Version**: 1.0

