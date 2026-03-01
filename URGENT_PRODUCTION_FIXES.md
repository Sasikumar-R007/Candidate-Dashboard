# 🚨 URGENT: Production Fixes Required

## Summary of Issues

1. **`last_viewed_at` column missing** → Search errors (500)
2. **Parse Resume 405 error** → Check frontend/backend routing
3. **Closure "Client not found"** → Client name mismatch (improved matching added)
4. **Admin/Client Pipeline empty** → Check data relationships

---

## ✅ IMMEDIATE ACTION REQUIRED

### Step 1: Add Missing Database Column (CRITICAL)

**Run this SQL in Neon SQL Editor:**

```sql
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS last_viewed_at TEXT;
```

**How to run:**
1. Go to https://console.neon.tech
2. Select your production project
3. Click **"SQL Editor"**
4. Paste the SQL above
5. Click **"Run"** (Ctrl+Enter)
6. Verify it worked:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'candidates' AND column_name = 'last_viewed_at';
   ```

**This fixes:** All search errors (`column "last_viewed_at" does not exist`)

---

### Step 2: Deploy Updated Backend Code

The closure endpoint has been improved with better client matching. After deploying:

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix: Improve closure client lookup and add last_viewed_at support"
   git push origin your-branch-name
   ```

2. **Deploy to Render:**
   - Render will auto-deploy if connected to your branch
   - OR manually trigger deployment in Render dashboard

---

### Step 3: Verify Pipeline Data

**Check if applications are properly tagged:**

Run in Neon SQL Editor:
```sql
-- Check applications with requirement_id
SELECT COUNT(*) as total,
       COUNT(requirement_id) as with_requirement,
       COUNT(recruiter_job_id) as with_job
FROM job_applications;

-- Check requirements
SELECT id, position, company, talent_advisor_id
FROM requirements
LIMIT 20;
```

**If pipeline is still empty:**
- Applications might not have `requirement_id` set
- Requirements might not be associated with the correct company
- Check Render logs for specific errors

---

### Step 4: Fix Parse Resume 405 Error

**Check:**
1. Open browser DevTools (F12) → Network tab
2. Try uploading a resume
3. Check the exact request:
   - URL: Should be `POST /api/recruiter/parse-resume`
   - Method: Should be `POST` (not GET)
   - Headers: Should include `Content-Type: multipart/form-data`
   - Body: Should have `resume` file field

**If still 405:**
- Check Render logs for routing errors
- Verify the route is registered in `routes.ts` (line ~4581)
- Check if there's a CORS issue

---

### Step 5: Fix Closure "Client Not Found"

**The code has been improved**, but you need to:

1. **Check what client name is being passed:**
   - Look at browser console when creating closure
   - The error response now includes available clients

2. **Verify client exists:**
   ```sql
   SELECT id, brand_name, company_name, client_code
   FROM clients 
   WHERE is_login_only = false;
   ```

3. **If client name doesn't match:**
   - Update the client name in database to match what's being passed
   - OR update frontend to pass correct client name

---

## 📋 Complete Checklist

- [ ] Run SQL migration to add `last_viewed_at` column
- [ ] Verify column was added successfully
- [ ] Deploy updated backend code to Render
- [ ] Test Source Resume search (should work now)
- [ ] Check Admin Pipeline (verify data appears)
- [ ] Check Client Pipeline (verify data appears)
- [ ] Test Parse Resume (check network tab for actual error)
- [ ] Test Create Closure (check client name matches)
- [ ] Check Render logs for any remaining errors

---

## 🔍 Debugging Commands

**Check database structure:**
```sql
-- Verify last_viewed_at exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'candidates' AND column_name = 'last_viewed_at';

-- Check applications
SELECT id, candidate_name, requirement_id, recruiter_job_id, status
FROM job_applications
LIMIT 10;

-- Check requirements
SELECT id, position, company, talent_advisor_id
FROM requirements
LIMIT 10;

-- Check clients
SELECT id, brand_name, company_name, client_code
FROM clients
WHERE is_login_only = false;
```

---

## 📞 If Issues Persist

1. **Check Render Logs:**
   - Go to Render dashboard → Your backend service → Logs
   - Look for specific error messages

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console and Network tabs
   - Look for detailed error messages

3. **Test Endpoints:**
   - Use Postman or curl to test endpoints directly
   - Verify authentication is working

---

## ✅ Expected Results After Fixes

- ✅ Source Resume search works (no `last_viewed_at` errors)
- ✅ Admin Pipeline shows candidates
- ✅ Client Pipeline shows candidates for their requirements  
- ✅ Closure creation works (if client name matches)
- ✅ Resume parsing works (if endpoint is called correctly)

---

## 📝 Files Changed

1. `PRODUCTION_DATABASE_MIGRATION.sql` - SQL to add missing column
2. `PRODUCTION_FIXES_GUIDE.md` - Detailed guide
3. `server/routes.ts` - Improved closure client lookup (case-insensitive, flexible matching)

---

**Priority Order:**
1. **CRITICAL:** Add `last_viewed_at` column (fixes search errors)
2. **HIGH:** Deploy updated backend code (fixes closure matching)
3. **MEDIUM:** Verify pipeline data relationships
4. **LOW:** Debug parse resume 405 error (might be frontend issue)



