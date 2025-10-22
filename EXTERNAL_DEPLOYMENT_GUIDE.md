# 🚀 Vercel + Render + Neon Deployment Guide

## Your Current Setup

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Vercel    │  -----> │   Render    │  -----> │    Neon     │
│  (Frontend) │         │  (Backend)  │         │ (Database)  │
└─────────────┘         └─────────────┘         └─────────────┘
   React/Vite              Express API           PostgreSQL
```

---

## ⚠️ CRITICAL ISSUE: Your render.yaml Points to Wrong Database!

**Problem:** Your `render.yaml` creates a Render-managed database, but you're using **external Neon**.

**Current render.yaml (WRONG):**
```yaml
databases:
  - name: staffos-db  # ← Creates Render database!
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: staffos-db  # ← Points to Render, not Neon!
```

**This means your backend might be using the wrong database!**

---

## 🔧 FIX #1: Update render.yaml

**Edit `render.yaml` to:**

```yaml
services:
  - type: web
    name: job-portal-backend
    env: node
    plan: starter
    buildCommand: npm run build:backend
    startCommand: npm run start:backend
    envVars:
      - key: NODE_ENV
        value: production
      - key: FRONTEND_URL
        sync: false
      - key: SESSION_SECRET
        sync: false
      - key: DATABASE_URL
        sync: false
      - key: BACKEND_URL
        sync: false

# REMOVE THE ENTIRE "databases" SECTION!
# You're using external Neon, not Render's database
```

Then commit, push, and redeploy on Render.

---

## 🔧 FIX #2: Set Render Environment Variables

Go to: Render Dashboard → Your Service → Environment

**Add these variables:**

### 1. DATABASE_URL (Neon Connection String)
```
DATABASE_URL=postgresql://[user]:[password]@[host].neon.tech/[database]?sslmode=require
```

**How to get this:**
1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the connection string
5. **IMPORTANT:** Ensure it ends with `?sslmode=require`

**Example:**
```
postgresql://user:abc123@ep-cool-darkness-123456.us-east-1.aws.neon.tech/staffos?sslmode=require
```

### 2. FRONTEND_URL (Your Vercel Domain)
```
FRONTEND_URL=https://your-app-name.vercel.app
```

**CRITICAL:**
- Must be your EXACT Vercel domain
- Include `https://`
- NO trailing slash
- Get this from Vercel dashboard

### 3. SESSION_SECRET (Random Strong String)
```
SESSION_SECRET=generate-a-random-secret-at-least-32-characters-long
```

**Generate one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. NODE_ENV
```
NODE_ENV=production
```

### 5. BACKEND_URL (Optional)
```
BACKEND_URL=https://job-portal-backend.onrender.com
```

---

## 🔧 FIX #3: Set Vercel Environment Variables

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these:**

### 1. VITE_API_URL (Your Render Backend URL)
```
VITE_API_URL=https://job-portal-backend.onrender.com
```

Get your Render URL from: Render Dashboard → Your Service → URL

### 2. VITE_FRONTEND_URL (Optional)
```
VITE_FRONTEND_URL=https://your-app-name.vercel.app
```

**After adding, redeploy on Vercel!**

---

## 🔧 FIX #4: Seed Your Neon Database

Your Neon database currently has **empty tables**!

### Option A: Run Seed Script Locally (Recommended)

```bash
# 1. Set your Neon DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# 2. Run seed script
npx tsx server/seed.ts

# 3. Verify it worked
npx tsx view-database.ts
```

### Option B: Manually Add Admin via Neon SQL Editor

1. Go to https://console.neon.tech
2. Go to your project → SQL Editor
3. Run this SQL:

```sql
-- First generate bcrypt hash for "admin123"
-- Use: https://bcrypt-generator.com/
-- Or run: node -e "console.log(require('bcrypt').hashSync('admin123', 10))"

INSERT INTO employees (
  "employeeId", "name", "email", "password", "role", "age", 
  "phone", "department", "joiningDate", "reportingTo", 
  "isActive", "createdAt"
) VALUES (
  'STTA001',
  'Admin User',
  'admin@staffos.com',
  '$2b$10$REPLACE_WITH_YOUR_BCRYPT_HASH',
  'admin',
  '30',
  '+1234567890',
  'Administration',
  '2024-01-01',
  'CEO',
  true,
  CURRENT_TIMESTAMP
);
```

---

## ✅ COMPLETE SETUP CHECKLIST

### Neon Database:
- [ ] Database created on Neon
- [ ] Connection string copied (with `?sslmode=require`)
- [ ] Tables exist (run `npm run db:push` if needed)
- [ ] Admin user seeded
- [ ] IP allowlist allows Render (or set to 0.0.0.0/0)

### Render Backend:
- [ ] `render.yaml` updated (databases section removed)
- [ ] `DATABASE_URL` set to Neon connection string
- [ ] `FRONTEND_URL` set to exact Vercel domain
- [ ] `SESSION_SECRET` set to random string
- [ ] `NODE_ENV=production` set
- [ ] Service redeployed
- [ ] No errors in deployment logs

### Vercel Frontend:
- [ ] `VITE_API_URL` set to Render backend URL
- [ ] Redeployed after adding env vars
- [ ] Site loads without errors

---

## 🧪 TESTING YOUR DEPLOYMENT

### Test 1: Check Backend is Running
```bash
curl https://job-portal-backend.onrender.com/api/health
```

### Test 2: Test CORS
```bash
curl -H "Origin: https://your-app.vercel.app" \
     -X OPTIONS \
     https://job-portal-backend.onrender.com/api/auth/employee-login
```

### Test 3: Check Render Logs
1. Go to Render Dashboard → Your Service → Logs
2. Look for: "🚀 Backend server running..."
3. Should see: "Frontend URL: https://your-app.vercel.app"
4. No database errors

### Test 4: End-to-End Login
1. Go to `https://your-app.vercel.app/employer-login`
2. Try: `admin@staffos.com` / `admin123`
3. Open browser DevTools → Network tab
4. Verify:
   - API calls go to Render
   - Cookies set with `Secure; SameSite=None`
   - Login works

### Test 5: Check Database
1. Go to Neon Console → SQL Editor
2. Run: `SELECT * FROM employees;`
3. Should see admin user

---

## 🚨 COMMON ISSUES & FIXES

### Issue: "CORS Error"
**Fix:**
- Set `FRONTEND_URL` on Render to exact Vercel domain
- Include `https://`, no trailing slash
- Redeploy Render

### Issue: "Cannot Connect to Database"
**Fix:**
- Add `?sslmode=require` to DATABASE_URL
- Check Neon IP allowlist (set to 0.0.0.0/0)
- Verify connection string is correct

### Issue: "Session Not Persisting"
**Fix:**
- Ensure `SESSION_SECRET` is set on Render
- Check cookies have `Secure; SameSite=None` in DevTools
- Both domains must use HTTPS

### Issue: "Admin Can't Login"
**Fix:**
- Seed Neon database: `npx tsx server/seed.ts`
- Check admin exists in Neon SQL Editor

---

## 📊 ENVIRONMENT VARIABLES SUMMARY

### Render:
```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
FRONTEND_URL=https://your-app-name.vercel.app
SESSION_SECRET=random-32-char-string
NODE_ENV=production
BACKEND_URL=https://job-portal-backend.onrender.com
```

### Vercel:
```bash
VITE_API_URL=https://job-portal-backend.onrender.com
VITE_FRONTEND_URL=https://your-app-name.vercel.app
```

---

## 🎯 QUICK ACTION STEPS

1. **Update render.yaml** → Remove databases section → Push → Redeploy
2. **Set Render env vars** → All 5 variables above
3. **Set Vercel env vars** → VITE_API_URL → Redeploy  
4. **Seed Neon database** → Run seed script with Neon DATABASE_URL
5. **Test login** → admin@staffos.com / admin123

**That's it! Your app should work now.** 🚀

---

**Questions?** Check your:
- Render logs for backend errors
- Vercel logs for frontend errors
- Browser DevTools for CORS/API errors
- Neon dashboard for database issues
