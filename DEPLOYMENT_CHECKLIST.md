# 🚀 Deployment Checklist for StaffOS

## ✅ Will Your App Work When Deployed?

**Short Answer: YES**, but you need to verify a few things!

---

## 🔍 Key Differences: Preview vs Production

### Development Preview (Current - replit.dev)
- ✅ You're seeing this now
- ✅ Temporary URL (*.replit.dev)
- ✅ Auto-restarts when you make changes
- ✅ Uses **development database**
- ✅ Browser dev tools available

### Production Deployment (After Publishing - replit.app)
- 🚀 Permanent URL (*.replit.app or custom domain)
- 🚀 Snapshot of your app's current state
- 🚀 Does NOT auto-restart (you must republish)
- 🚀 Uses **production database** (separate from development!)
- 🚀 Optimized and built for performance

---

## ⚠️ CRITICAL: Development vs Production Database

**IMPORTANT:** Replit keeps TWO separate databases:

1. **Development Database** (what you've been using)
   - Your test data is here
   - The 3 employees and 2 candidates you see
   - Modified by running seed scripts

2. **Production Database** (for your live site)
   - **COMPLETELY SEPARATE** from development
   - **STARTS EMPTY** when you first deploy
   - You need to seed this separately!

**What Happens When You Publish:**
- ✅ Database **schema** (tables, columns) is copied to production
- ❌ Database **data** (your users, candidates) is NOT copied
- ❌ You must seed production database separately

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ 1. Environment Variables (DATABASE_URL)

**Status:** ✅ Already configured

Your `DATABASE_URL` is set in Secrets and will automatically work in production.

**To Verify:**
1. Click "Secrets" in left sidebar
2. Confirm `DATABASE_URL` exists
3. This automatically syncs to production deployment

### ✅ 2. Deployment Configuration

**Status:** ✅ Already configured

Your `.replit` file shows:
```
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]
```

This means:
- ✅ Autoscale deployment (scales based on traffic)
- ✅ Builds with `npm run build` before deploying
- ✅ Runs with `npm run start` in production

### ✅ 3. Build Scripts

**To Verify:**
Check your `package.json` has these scripts:

```bash
# Check build script exists
grep "build" package.json

# Check start script exists  
grep "start" package.json
```

**Status:** ✅ Already configured
- `"build": "vite build && esbuild..."`
- `"start": "npx cross-env NODE_ENV=production node dist/index.js"`

### ✅ 4. Production Database Schema

**You MUST do this after first deployment:**

The schema (table structure) will be automatically pushed, but you need to seed initial data.

### ✅ 5. File Uploads Directory

**Check:** Your `uploads/` folder exists

**Status:** ✅ Already exists

**Note:** In production, uploaded files are NOT persistent on Autoscale deployments. Consider using Replit Object Storage for production file uploads.

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Pre-Deployment Checks

```bash
# 1. Test build locally
npm run build

# 2. Verify build succeeded (check for dist/ folder)
ls -la dist/

# 3. Test production mode locally
npm run start
```

**Expected:** App should start without errors.

### Step 2: Deploy to Production

1. **Click "Deploy" button** in Replit (top right)
2. **Choose deployment type:** Autoscale (already configured)
3. **Review configuration**
4. **Click "Deploy"**

### Step 3: Wait for Deployment

- Replit will:
  - ✅ Run `npm run build`
  - ✅ Create a snapshot of your app
  - ✅ Deploy to production servers
  - ✅ Create production database schema
  - ✅ Assign you a `.replit.app` URL

### Step 4: Seed Production Database

**CRITICAL STEP - Don't skip this!**

After deployment, your production database has empty tables. You need to add the admin user.

**Option A: Run Seed Script in Production (Recommended)**

1. Go to your deployed app's admin panel (if available)
2. Or use Replit's deployment console/shell
3. Run: `npx tsx server/seed.ts`

**Option B: Manually Add Admin via Database UI**

1. In Replit, click "Database"
2. Switch to "Production" database (toggle at top)
3. Go to `employees` table
4. Click "Add Row"
5. Add admin user manually

**Option C: Create via API**

```bash
# Replace YOUR_APP_URL with your actual deployed URL
curl -X POST https://YOUR_APP_URL.replit.app/api/admin/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "STTA001",
    "name": "Admin User",
    "email": "admin@staffos.com",
    "password": "admin123",
    "role": "admin",
    "age": "30",
    "phone": "+1234567890",
    "department": "Administration",
    "joiningDate": "2024-01-01",
    "reportingTo": "CEO"
  }'
```

### Step 5: Test Your Deployed App

1. **Visit your production URL** (*.replit.app)
2. **Test admin login:**
   - Go to `/employer-login`
   - Use: `admin@staffos.com` / `admin123`
3. **Test candidate registration:**
   - Go to `/candidate-login`
   - Register a new account
   - Verify OTP works (production should use real email)
4. **Test employee creation:**
   - Login as admin
   - Try adding a new employee

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### 1. Email Service (For OTP in Production)

**Current:** OTP is logged to console (development only)

**Production:** You need to configure email service

**Options:**
- Set up SMTP credentials (Gmail, SendGrid, etc.)
- Or use a service like Resend, Postmark, or AWS SES

**Add to Secrets:**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 2. File Uploads (If Using)

**Current:** Files saved to `uploads/` folder

**Problem:** Autoscale deployments don't persist files

**Solution:** Use Replit Object Storage

1. Enable Object Storage in your Repl
2. Update file upload code to use Object Storage
3. Or switch to Reserved VM deployment (has persistent storage)

### 3. Custom Domain (Optional)

1. Click "Deploy" → "Domains"
2. Add your custom domain
3. Update DNS settings as instructed
4. Enable HTTPS (automatic)

### 4. Environment-Specific Configuration

Your app can detect production environment:

```typescript
// In your code
if (process.env.REPLIT_DEPLOYMENT === '1') {
  // Production-specific logic
} else {
  // Development-specific logic
}
```

---

## 📊 MONITORING YOUR DEPLOYMENT

After deploying, monitor:

1. **Deployment Status**
   - Green = Running
   - Red = Error (check logs)

2. **Logs**
   - View deployment logs in Replit
   - Check for startup errors

3. **Analytics**
   - Replit provides basic analytics
   - Track requests, errors, response times

4. **Database**
   - Switch to "Production" in Database UI
   - Verify data is being saved correctly

---

## ✅ FINAL CHECKLIST BEFORE DEPLOYING

Use this checklist:

- [ ] ✅ `DATABASE_URL` secret is set
- [ ] ✅ Build script works (`npm run build`)
- [ ] ✅ Start script works (`npm run start`)
- [ ] ✅ Deployment config is correct in `.replit`
- [ ] ✅ All dependencies are in `package.json`
- [ ] ⚠️  Plan to seed production database after deploy
- [ ] ⚠️  Plan to configure email service (for OTP)
- [ ] ⚠️  Plan for file uploads (Object Storage or Reserved VM)
- [ ] ✅ Test all critical user flows in preview

**Items marked ✅ are already done!**

**Items marked ⚠️ need attention after deployment.**

---

## 🚨 COMMON DEPLOYMENT ISSUES

### Issue 1: "Cannot connect to database"
**Cause:** DATABASE_URL not set in production
**Fix:** Check Secrets, ensure it syncs to deployment

### Issue 2: "Admin login doesn't work"
**Cause:** Production database is empty
**Fix:** Seed production database with admin user

### Issue 3: "OTP not sending"
**Cause:** Email service not configured
**Fix:** Set up email service or check console logs

### Issue 4: "Uploaded files disappear"
**Cause:** Autoscale doesn't persist files
**Fix:** Use Replit Object Storage or Reserved VM

### Issue 5: "App crashes on startup"
**Cause:** Build failed or missing dependencies
**Fix:** Check deployment logs, ensure all packages in package.json

---

## 🎯 DEPLOYMENT TYPES EXPLAINED

### Autoscale (Current - Recommended for you)
- ✅ Scales automatically based on traffic
- ✅ Pay only for what you use
- ✅ Goes to sleep when idle (saves cost)
- ❌ No persistent file storage
- ❌ Cold starts when waking up

**Best for:** Web apps, APIs, most use cases

### Reserved VM
- ✅ Always running (no cold starts)
- ✅ Persistent file storage
- ✅ More control
- ❌ Higher cost (always billed)

**Best for:** Apps needing persistent files or 24/7 uptime

### Static
- ✅ Very cheap
- ✅ Fast CDN delivery
- ❌ No server-side code

**Best for:** Static websites only (not applicable for you)

---

## 📝 DEPLOYMENT COMMAND REFERENCE

```bash
# Test build locally
npm run build

# Test production mode locally
npm run start

# View build output
ls -la dist/

# Check deployment configuration
cat .replit

# Access production database (after deploy)
# Use Replit Database UI and switch to "Production"

# View deployment logs
# Use Replit Deployments panel
```

---

## ✨ YOUR DEPLOYMENT IS READY!

**What's Already Done:**
✅ Database connection configured
✅ Deployment settings configured
✅ Build and start scripts set up
✅ Development environment fully tested

**What You Need to Do:**
1. Click "Deploy" button
2. Wait for deployment to complete
3. Seed production database with admin user
4. Test your deployed app
5. (Optional) Configure email service for OTP
6. (Optional) Set up custom domain

**Your app WILL work in production!** 🎉

---

**Last Updated:** October 22, 2025  
**Deployment Type:** Autoscale  
**Status:** Ready to Deploy
