# ⚡ Quick Fix Checklist - Vercel + Render + Neon

## 🔴 CRITICAL ISSUES TO FIX NOW

### 1. Your render.yaml is Wrong!

**Current Problem:**
```yaml
databases:
  - name: staffos-db  # ← This creates a Render database!
```

**You're using Neon, not Render's database!**

**Fix:** Edit `render.yaml` and **DELETE** the entire `databases` section.

---

### 2. Environment Variables Missing

You need to set these:

#### On Render:
```
DATABASE_URL=your-neon-connection-string?sslmode=require
FRONTEND_URL=https://your-exact-vercel-domain.vercel.app
SESSION_SECRET=random-secret-32-chars-minimum
NODE_ENV=production
```

#### On Vercel:
```
VITE_API_URL=https://your-render-backend.onrender.com
```

---

### 3. Database is Empty

Your Neon database needs admin user!

**Fix:**
```bash
export DATABASE_URL="your-neon-connection-string"
npx tsx server/seed.ts
```

---

## ✅ Step-by-Step Action Plan

### Step 1: Get Your URLs
- [ ] Vercel frontend URL: __________________
- [ ] Render backend URL: __________________
- [ ] Neon database URL: __________________

### Step 2: Fix render.yaml
- [ ] Open `render.yaml`
- [ ] Delete entire `databases:` section (lines 20-24)
- [ ] Delete `fromDatabase:` section (lines 16-18)
- [ ] Change line 15-16 to just: `sync: false`
- [ ] Commit and push

### Step 3: Set Render Environment Variables
Go to: Render Dashboard → Your Service → Environment

- [ ] DATABASE_URL = (paste your Neon connection string)
- [ ] FRONTEND_URL = (paste your Vercel URL)
- [ ] SESSION_SECRET = (generate random: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] NODE_ENV = production
- [ ] Click "Save"
- [ ] Click "Manual Deploy" → "Deploy latest commit"

### Step 4: Set Vercel Environment Variables
Go to: Vercel Dashboard → Settings → Environment Variables

- [ ] VITE_API_URL = (paste your Render backend URL)
- [ ] Click "Save"
- [ ] Go to Deployments → Click "..." → "Redeploy"

### Step 5: Seed Neon Database
```bash
# In your terminal:
export DATABASE_URL="paste-your-neon-connection-string-here"
npx tsx server/seed.ts
```

- [ ] Seed script completed
- [ ] Verify: `npx tsx view-database.ts`

### Step 6: Test Everything
- [ ] Visit your Vercel site
- [ ] Go to `/employer-login`
- [ ] Login with: `admin@staffos.com` / `admin123`
- [ ] Should work! ✅

---

## 📋 Quick Reference

### Where to Get Neon Connection String:
1. https://console.neon.tech
2. Your project → Connection Details
3. Copy "Connection string"
4. Make sure it ends with: `?sslmode=require`

### Where to Get Vercel URL:
1. Vercel Dashboard
2. Your project → View
3. Copy the URL (e.g., `https://your-app.vercel.app`)

### Where to Get Render URL:
1. Render Dashboard
2. Your service
3. Top shows URL (e.g., `https://job-portal-backend.onrender.com`)

---

## 🚨 If Something Doesn't Work

### Can't login?
→ Check Neon database has admin user (run seed script)

### CORS error?
→ Check FRONTEND_URL on Render matches exact Vercel domain

### Database connection error?
→ Add `?sslmode=require` to your DATABASE_URL

### API calls failing?
→ Check VITE_API_URL on Vercel matches Render backend URL

---

**Time to complete: 15-20 minutes**
**Difficulty: Medium**
**Cost: $0 (using free tiers)**

Read full guide: `EXTERNAL_DEPLOYMENT_GUIDE.md`
