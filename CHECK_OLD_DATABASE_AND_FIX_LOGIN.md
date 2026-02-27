# Check Old Database & Fix Login Issues
## Simple Step-by-Step Guide

---

## ✅ Step 1: Check if Old Database Has Data

### Method 1: Using Neon Dashboard (Easiest)

1. **Go to Neon Dashboard**: https://console.neon.tech
2. **Select your OLD database project** (the one you've been using for testing)
3. **Click "SQL Editor"** in left sidebar
4. **Run these queries one by one:**

```sql
-- Check employees count
SELECT COUNT(*) as employee_count FROM employees;

-- Check users count  
SELECT COUNT(*) as user_count FROM users;

-- Check candidates count
SELECT COUNT(*) as candidate_count FROM candidates;

-- Check if you have any employees with passwords
SELECT COUNT(*) as employees_with_passwords 
FROM employees 
WHERE password IS NOT NULL AND password != '';

-- See sample employees
SELECT employee_id, name, email, role, is_active 
FROM employees 
LIMIT 5;
```

**What to look for:**
- ✅ If counts are > 0 → Database has data
- ❌ If counts are 0 → Database is empty

---

## ✅ Step 2: Check Which Database Your Development Backend is Using

### Check Render Backend Configuration

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your development backend** (`staffosdemo-backend` or old backend name)
3. **Go to "Environment" tab**
4. **Check `DATABASE_URL` value:**
   - It should point to your **OLD database** connection string
   - Should look like: `postgresql://...@ep-xxx.neon.tech/neondb?...`

**If it's pointing to wrong database:**
- Update it to point to your OLD database connection string
- Save and wait for redeploy (2-3 minutes)

---

## ✅ Step 3: Check Why Login Isn't Working

### Common Issues:

#### Issue 1: Employees Don't Have Passwords Set

**Check:**
```sql
-- In Neon SQL Editor (OLD database)
SELECT employee_id, name, email, password, role 
FROM employees 
WHERE email = 'your_test_email@example.com';
```

**If `password` is NULL or empty:**
- That employee can't login
- You need to set a password for them

**Fix:**
```sql
-- Set password for an employee (replace with actual values)
-- Password will be hashed by your app, but you can check if it exists
UPDATE employees 
SET password = '$2b$10$...' -- This should be a bcrypt hash
WHERE email = 'your_test_email@example.com';
```

**Better way:** Use your app's password reset/creation feature, or create a new employee through your app.

---

#### Issue 2: Session Table Missing

**Check:**
```sql
-- In Neon SQL Editor (OLD database)
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'session';
```

**If no results:**
- Session table is missing!
- This will break login

**Fix:**
1. Go to Neon SQL Editor (OLD database)
2. Run this SQL (from `CREATE_SESSION_TABLE.sql`):

```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

---

#### Issue 3: Employee is Inactive

**Check:**
```sql
-- In Neon SQL Editor (OLD database)
SELECT employee_id, name, email, is_active 
FROM employees 
WHERE email = 'your_test_email@example.com';
```

**If `is_active` is `false` or `NULL`:**
- Employee can't login

**Fix:**
```sql
UPDATE employees 
SET is_active = true 
WHERE email = 'your_test_email@example.com';
```

---

#### Issue 4: Backend Not Connected to Old Database

**Check:**
1. Go to Render → Your development backend → Environment
2. Verify `DATABASE_URL` points to OLD database
3. If wrong, update it and redeploy

---

## ✅ Step 4: Verify Everything is Connected

### Test the Connection:

1. **Check backend logs in Render:**
   - Go to Render → Your backend → Logs
   - Look for database connection errors
   - Should see: "Server started" or similar

2. **Test login from frontend:**
   - Use your development URL
   - Try to login with an employee email that you verified has:
     - ✅ Password set
     - ✅ is_active = true
     - ✅ Exists in database

3. **Check browser console (F12):**
   - Look for API errors
   - Check Network tab for `/api/auth/employee-login` request
   - See what error it returns

---

## 🔍 Quick Diagnostic Checklist

Run these in Neon SQL Editor (OLD database) to diagnose:

```sql
-- 1. Check if database has data
SELECT 
  (SELECT COUNT(*) FROM employees) as employees,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM candidates) as candidates;

-- 2. Check employees with login capability
SELECT 
  COUNT(*) as total_employees,
  COUNT(password) as employees_with_passwords,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_employees
FROM employees;

-- 3. Check session table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'session'
) as session_table_exists;

-- 4. See sample employee (replace email)
SELECT 
  employee_id, 
  name, 
  email, 
  role,
  CASE WHEN password IS NULL THEN 'NO PASSWORD' 
       WHEN password = '' THEN 'EMPTY PASSWORD'
       ELSE 'HAS PASSWORD' END as password_status,
  is_active
FROM employees 
WHERE email = 'your_test_email@example.com';
```

---

## 🎯 Summary

**For Development (Testing):**
- ✅ Should use OLD database (with all your data)
- ✅ Backend should point to OLD database
- ✅ Should have session table
- ✅ Employees should have passwords set
- ✅ Employees should be active

**To Fix Login:**
1. Check old database has data ✅
2. Check backend points to old database ✅
3. Check session table exists ✅
4. Check employees have passwords ✅
5. Check employees are active ✅

---

## 🆘 Still Not Working?

**Check these:**
1. **Backend logs** - Look for errors in Render
2. **Browser console** - Check for API errors
3. **Network tab** - See what `/api/auth/employee-login` returns
4. **Database connection** - Verify `DATABASE_URL` in Render is correct

**Common error messages:**
- "Invalid email or password" → Employee doesn't exist OR password wrong
- "Login credentials not configured" → Employee has no password set
- "Account is inactive" → Employee's `is_active` is false
- "Connection refused" → Backend can't connect to database

