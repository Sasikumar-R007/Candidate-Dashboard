# Production Fixes Guide - URGENT

## 🚨 Critical Issues to Fix

### 1. **Database Migration - `last_viewed_at` Column Missing**

**Error:** `column "last_viewed_at" does not exist`

**Fix:** Run this SQL in your **Neon SQL Editor**:

```sql
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS last_viewed_at TEXT;
```

**Steps:**
1. Go to https://console.neon.tech
2. Select your production project
3. Open **SQL Editor**
4. Paste the SQL above
5. Click **Run** (or press Ctrl+Enter)
6. Verify with:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'candidates' AND column_name = 'last_viewed_at';
   ```

---

### 2. **Parse Resume 405 Error**

**Error:** `POST /api/recruiter/parse-resume 405 (Method Not Allowed)`

**Possible Causes:**
- Frontend might be calling the wrong endpoint
- CORS issue
- Route not registered properly

**Check:**
- Verify the frontend is calling `POST /api/recruiter/parse-resume`
- Check if the route is registered in `routes.ts` (it should be at line ~4581)
- Ensure the request includes the `resume` file field

**Temporary Fix:** The endpoint exists and should work. If it's still failing, check:
1. Render logs for the backend
2. Network tab in browser to see the exact request being sent
3. Verify the file upload is using FormData with field name `resume`

---

### 3. **Closure "Client Not Found" Error**

**Error:** `Failed to create closure: Error: 400: {"message":"Client not found. Please ensure the client exists in the system."}`

**Issue:** The closure endpoint is looking for a client by `brandName` or `companyName`, but the name being passed might not match exactly.

**Fix:** The code has been improved to handle case-insensitive matching and partial matches. However, you need to ensure:

1. **Check what client name is being passed:**
   - Look at the browser console/network tab when creating a closure
   - The `client` field in the request body should match a client's `brandName` or `companyName` in the database

2. **Verify clients exist in database:**
   ```sql
   SELECT id, brand_name, company_name 
   FROM clients 
   WHERE is_login_only = false;
   ```

3. **If client names don't match:**
   - Update the client name in the database to match what's being passed
   - OR update the frontend to pass the correct client name

---

### 4. **Admin and Client Pipeline Not Showing Data**

**Issue:** Pipeline sessions are empty even though candidates exist in Recruiter pipeline.

**Possible Causes:**
1. Applications might not be tagged to requirements properly
2. Filter logic might be too restrictive
3. Database queries might be failing silently

**Check:**
1. **Verify applications have `requirementId`:**
   ```sql
   SELECT id, candidate_name, requirement_id, recruiter_job_id 
   FROM job_applications 
   LIMIT 10;
   ```

2. **Check if requirements exist:**
   ```sql
   SELECT id, position, company 
   FROM requirements 
   LIMIT 10;
   ```

3. **For Admin Pipeline:**
   - Check if applications are tagged to requirements or recruiter jobs
   - Verify team leader filter is working

4. **For Client Pipeline:**
   - Verify requirements are associated with the client's company
   - Check if `getRequirementsByCompany` is returning the correct requirements
   - Ensure applications have `requirementId` that matches client's requirements

**Debug Steps:**
1. Check Render backend logs for errors
2. Test the endpoints directly:
   - `GET /api/admin/pipeline` (with admin auth)
   - `GET /api/client/pipeline` (with client auth)
3. Check the response in browser Network tab

---

## 📋 Complete Migration Checklist

Run these SQL commands in **Neon SQL Editor** (production database):

```sql
-- 1. Add last_viewed_at column (FIXES SEARCH ERRORS)
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS last_viewed_at TEXT;

-- 2. Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'candidates' AND column_name = 'last_viewed_at';

-- 3. Check if clients exist (for closure issue)
SELECT id, brand_name, company_name, client_code
FROM clients 
WHERE is_login_only = false;

-- 4. Check if applications have requirement_id (for pipeline issue)
SELECT COUNT(*) as total_applications,
       COUNT(requirement_id) as apps_with_requirement,
       COUNT(recruiter_job_id) as apps_with_job
FROM job_applications;

-- 5. Check requirements and their companies
SELECT r.id, r.position, r.company, r.talent_advisor_id
FROM requirements r
LIMIT 20;
```

---

## 🔧 After Running Migrations

1. **Restart your Render backend service** (if needed)
2. **Clear browser cache** and refresh the pages
3. **Test each feature:**
   - ✅ Source Resume search (should work after adding `last_viewed_at`)
   - ✅ Recruiter Upload Resume (check network tab for actual error)
   - ✅ Create Closure (verify client name matches)
   - ✅ Admin Pipeline (check if data appears)
   - ✅ Client Pipeline (check if data appears)

---

## 📞 If Issues Persist

1. **Check Render Logs:**
   - Go to Render dashboard
   - Click on your backend service
   - Check "Logs" tab for errors

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console and Network tabs
   - Look for specific error messages

3. **Test Endpoints Directly:**
   - Use Postman or curl to test endpoints
   - Verify authentication is working
   - Check response data

---

## ✅ Expected Results After Fixes

- ✅ Source Resume search works without `last_viewed_at` errors
- ✅ Admin Pipeline shows candidates
- ✅ Client Pipeline shows candidates for their requirements
- ✅ Closure creation works (if client name matches)
- ✅ Resume parsing works (if endpoint is called correctly)



