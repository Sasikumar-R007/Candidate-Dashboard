# Deployment Guide - Admin Dashboard Updates

## Changes Summary

This deployment includes the following updates:
1. ✅ Fixed duplicate close button in "Add New Requirement" modal
2. ✅ Fixed Metrics page - Key Metrics "Show More" button with working filters
3. ✅ Removed "Reset Data" button from Performance Data modal
4. ✅ Changed Default Rate calendars to normal HTML date inputs
5. ✅ Added logo upload field to Client Details modal
6. ✅ Removed floating "?" help button

## Database Changes Required

### ⚠️ IMPORTANT: Database Migration Required

A new column needs to be added to the `clients` table:

**Migration File:** `server/migrations/add_client_logo.sql`

**SQL to Execute:**
```sql
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
```

### Steps to Apply Database Migration

1. **Connect to your database** (dev/staging/production)
2. **Run the migration:**
   ```bash
   # Option 1: Using psql
   psql -U your_username -d your_database -f server/migrations/add_client_logo.sql
   
   # Option 2: Using database client (pgAdmin, DBeaver, etc.)
   # Copy and paste the SQL from add_client_logo.sql
   ```

3. **Verify the migration:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'clients' AND column_name = 'logo';
   ```

## Git Deployment Procedure

### Prerequisites
- Ensure all changes are committed locally
- Ensure you have access to dev and stage branches
- Ensure database migrations are ready

### Step 1: Commit All Changes
```bash
# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: Admin dashboard UI fixes and add client logo feature

- Remove duplicate close button in Add Requirement modal
- Fix Metrics page Key Metrics Show More button and filters
- Remove Reset Data button from Performance Data modal
- Change Default Rate calendars to normal date inputs
- Add logo upload field to Client Details modal
- Remove floating help button
- Add database migration for client logo column"
```

### Step 2: Push to Dev Branch
```bash
# Switch to dev branch (or create if doesn't exist)
git checkout dev
# OR if dev doesn't exist:
# git checkout -b dev

# Merge your changes into dev
git merge main  # or your current branch name

# Push to remote dev branch
git push origin dev
```

### Step 3: Push to Stage Branch
```bash
# Switch to stage branch
git checkout stage
# OR if stage doesn't exist:
# git checkout -b stage

# Merge your changes into stage
git merge dev  # or main if dev doesn't exist

# Push to remote stage branch
git push origin stage
```

### Alternative: Direct Push (if branches exist)
```bash
# Push current branch to dev
git push origin HEAD:dev

# Push current branch to stage
git push origin HEAD:stage
```

## Deployment Steps

### For Dev Environment

1. **Apply Database Migration:**
   ```bash
   # Connect to dev database and run migration
   psql -h dev-db-host -U dev-user -d dev-database -f server/migrations/add_client_logo.sql
   ```

2. **Deploy Code:**
   - If using CI/CD pipeline, the push to `dev` branch should trigger automatic deployment
   - If manual deployment:
     ```bash
     # SSH into dev server
     ssh dev-server
     
     # Navigate to project directory
     cd /path/to/Candidate-Dashboard
     
     # Pull latest changes
     git checkout dev
     git pull origin dev
     
     # Install dependencies (if needed)
     npm install
     
     # Build client (if needed)
     cd client
     npm run build
     cd ..
     
     # Restart server
     pm2 restart candidate-dashboard
     # OR
     systemctl restart candidate-dashboard
     ```

### For Staging Environment

1. **Apply Database Migration:**
   ```bash
   # Connect to staging database and run migration
   psql -h staging-db-host -U staging-user -d staging-database -f server/migrations/add_client_logo.sql
   ```

2. **Deploy Code:**
   - If using CI/CD pipeline, the push to `stage` branch should trigger automatic deployment
   - If manual deployment, follow same steps as dev but use staging credentials

## Verification Checklist

After deployment, verify:

- [ ] Database migration applied successfully (logo column exists)
- [ ] "Add New Requirement" modal has only one close button
- [ ] Metrics page "Show More" button opens modal with full graph
- [ ] Client and Period filters work in Metrics modal
- [ ] "No Clients" shows in dropdown when no clients available
- [ ] "Reset Data" button removed from Performance Data modal
- [ ] Default Rate section uses normal date inputs (not StandardDatePicker)
- [ ] Client Details modal has logo upload field
- [ ] Logo upload works and saves to database
- [ ] Floating "?" button removed
- [ ] "? Help" buttons still work in other locations

## Rollback Procedure (if needed)

If issues occur:

1. **Revert Code:**
   ```bash
   git revert <commit-hash>
   git push origin dev
   git push origin stage
   ```

2. **Revert Database (if needed):**
   ```sql
   ALTER TABLE clients DROP COLUMN IF EXISTS logo;
   ```

## Notes

- The logo upload endpoint is: `POST /api/admin/upload-logo`
- Logo files are stored in the `uploads/` directory
- Logo URLs are stored in the `clients.logo` column
- Maximum file size: 5MB (configured in multer)
- Allowed formats: JPEG, PNG, GIF, WebP, AVIF

## Support

If you encounter any issues during deployment:
1. Check server logs for errors
2. Verify database connection
3. Check file upload permissions for `uploads/` directory
4. Verify environment variables are set correctly

