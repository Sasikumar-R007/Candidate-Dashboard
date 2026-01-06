# Production Fixes and Deployment Guide

## Issues Fixed

### 1. ✅ Fixed Invalid Regex Pattern Error
**Error**: `Pattern attribute value [0-9+\-()\s]* is not a valid regular expression`

**Fix**: Removed the invalid `pattern` attribute from phone number inputs in `UploadResumeModal.tsx`. The JavaScript validation (`handlePhoneChange`) already handles input validation, making the HTML pattern attribute redundant and causing errors.

**Files Changed**:
- `client/src/components/dashboard/modals/UploadResumeModal.tsx` (lines 405, 414)

### 2. ⚠️ Database Schema Mismatch - Missing `last_login_at` Column
**Error**: `column "last_login_at" of relation "employees" does not exist`

**Root Cause**: The production database schema is out of sync with the code schema. The `employees` table is missing the `last_login_at` column.

**Solution**: Run database migration to add the missing column.

## Database Migration Steps

### Option 1: Using Drizzle Push (Recommended for Development/Staging)
```bash
# Make sure you have the correct DATABASE_URL in your .env file
npm run db:push
```

### Option 2: Manual SQL Migration (Recommended for Production)
Run this SQL command in your production database:

```sql
-- Add last_login_at column to employees table if it doesn't exist
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS last_login_at TEXT;
```

### Option 3: Using Migration File
If you have database migration tools set up, you can use the existing migration file:
- `server/migrations/add_last_login_at.sql`

## Backend API Errors Analysis

### 1. `/api/admin/client-jds` - 500 Error
**Possible Causes**:
- Database connection issues
- Missing columns in `requirements` table
- Missing columns in `clients` table

**Check**: Verify that all required columns exist in both tables.

### 2. `/api/admin/requirements` - 400/500 Errors
**Possible Causes**:
- Invalid data being sent (400)
- Missing database columns (500)
- Validation errors

**Check**: 
- Verify request payload matches the schema
- Check database schema matches `shared/schema.ts`

### 3. `/api/recruiter/upload/resume` - 405 Error
**Possible Causes**:
- Route not properly configured
- Method mismatch (POST vs GET)
- Middleware issues

**Check**: The route exists at line 3814 in `server/routes.ts`. Verify:
- Route is properly registered
- `resumeUpload` middleware is configured
- File upload directory exists and is writable

### 4. `/api/admin/clients/credentials` - 500 Error
**Error**: Missing `last_login_at` column (as shown in image)

**Fix**: Run the database migration above.

### 5. Profile Data Loading Errors
**Error**: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Cause**: API endpoints are returning HTML error pages instead of JSON, likely due to:
- 404 errors (route not found)
- 500 errors (server errors)
- Authentication failures

**Fix**: After fixing database schema issues, these should resolve.

## Complete Deployment Checklist

### Before Deployment

1. **Fix Frontend Issues** ✅
   - [x] Remove invalid regex pattern from phone inputs
   - [x] Test form validation

2. **Database Schema Sync** ⚠️
   - [ ] Run `npm run db:push` locally to verify schema
   - [ ] OR run manual SQL migration in production database
   - [ ] Verify `last_login_at` column exists in `employees` table
   - [ ] Check all other tables match schema in `shared/schema.ts`

3. **Environment Variables**
   - [ ] Verify `DATABASE_URL` is set correctly in production
   - [ ] Verify `NODE_ENV=production` in production
   - [ ] Verify all required environment variables are set

4. **Backend Routes**
   - [ ] Verify all routes are properly registered
   - [ ] Check file upload middleware configuration
   - [ ] Verify authentication middleware is working

### Deployment Steps

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Run Database Migration**
   ```bash
   # Option 1: If using Drizzle Push
   npm run db:push
   
   # Option 2: If using manual SQL (recommended for production)
   # Connect to your production database and run:
   ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_login_at TEXT;
   ```

3. **Deploy to Production**
   - Push code to your repository
   - Deploy to Render/your hosting platform
   - Wait for deployment to complete

4. **Verify Deployment**
   - Check that all API endpoints return JSON (not HTML)
   - Test requirement creation
   - Test resume upload
   - Test client user creation
   - Check browser console for errors

### Post-Deployment Verification

1. **Test Requirement Adding**
   - [ ] Create a new requirement
   - [ ] Verify it appears in the requirements list
   - [ ] Check browser console for errors

2. **Test Resume Upload**
   - [ ] Upload a resume file
   - [ ] Verify file is saved
   - [ ] Check browser console for errors

3. **Test Client User Creation**
   - [ ] Create a new client user
   - [ ] Verify user is created successfully
   - [ ] Check browser console for errors

4. **Test Admin Login**
   - [ ] Login as admin
   - [ ] Verify profile data loads
   - [ ] Check browser console for errors

## Quick Fix Commands

### For Local Testing
```bash
# Fix database schema locally
npm run db:push

# Test the application
npm run dev
```

### For Production Database
```sql
-- Run this in your production database
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_login_at TEXT;
```

## Additional Notes

1. **Why Localhost Works but Production Doesn't**
   - Local database might have been migrated previously
   - Production database schema is outdated
   - Environment variables might differ

2. **405 Method Not Allowed Errors**
   - Usually means the route exists but the HTTP method is wrong
   - Check that POST requests are being sent to POST routes
   - Verify middleware isn't blocking requests

3. **500 Internal Server Errors**
   - Usually database-related
   - Check server logs for detailed error messages
   - Verify database connection is working
   - Check that all required columns exist

4. **400 Bad Request Errors**
   - Usually validation errors
   - Check request payload matches expected schema
   - Verify all required fields are provided

## Need Help?

If issues persist after following this guide:
1. Check server logs for detailed error messages
2. Verify database connection string is correct
3. Ensure all environment variables are set
4. Check that database user has proper permissions
5. Verify all tables and columns exist as per schema

