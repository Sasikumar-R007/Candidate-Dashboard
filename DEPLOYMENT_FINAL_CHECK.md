# 🚀 Final Deployment Checklist - Vercel & Render

**Date:** $(date)  
**Status:** ✅ Ready for Deployment

---

## ✅ Pre-Deployment Verification Complete

### 1. Build Configuration ✅

- [x] **`package.json`** - All scripts configured correctly
  - `build`: Builds both frontend and backend
  - `build:frontend`: Vite build for Vercel
  - `build:backend`: esbuild for Render
  - `start`: Production start command
  - Node version: >=20.0.0

- [x] **`vercel.json`** - Frontend configuration correct
  - Build command: `npm run build:frontend`
  - Output directory: `dist/public`
  - Framework: vite
  - Rewrites configured for SPA routing

- [x] **`render.yaml`** - Backend configuration correct
  - Build command: `npm install && npm run build:backend`
  - Start command: `npm run start:backend`
  - Health check: `/api/health`
  - Environment variables template included

### 2. Code Quality ✅

- [x] **No hardcoded localhost URLs** (uses environment variables)
- [x] **CORS properly configured** for production
- [x] **Session configuration** correct for production
- [x] **Database connection** uses environment variables
- [x] **New features implemented**:
  - JD sharing feature ✅
  - Status column with login detection ✅
  - Active sessions API endpoint ✅

### 3. Environment Variables Required

#### 🔷 VERCEL (Frontend) - Set in Vercel Dashboard

```
VITE_API_URL=https://your-render-backend.onrender.com
```

**Note:** Replace `your-render-backend.onrender.com` with your actual Render backend URL.

---

#### 🟦 RENDER (Backend) - Set in Render Dashboard

**REQUIRED (Critical):**
```
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
SESSION_SECRET=your-random-secret-key-minimum-32-characters
FRONTEND_URL=https://your-vercel-project.vercel.app
NODE_ENV=production
PORT=5000
```

**OPTIONAL (Email Features):**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=StaffOS <noreply@yourdomain.com>
```

**OPTIONAL (Google OAuth):**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**OPTIONAL (Admin Features):**
```
ADMIN_RESET_KEY=secure-random-admin-reset-key
```

**⚠️ IMPORTANT NOTES:**
- `SESSION_SECRET` must be at least 32 characters
- Generate with: `openssl rand -hex 32`
- `FRONTEND_URL` must match your Vercel deployment URL exactly
- `DATABASE_URL` must include SSL mode for cloud databases

---

## 📋 Step-by-Step Deployment Process

### Step 1: Verify Git Status

```bash
# Check current status
git status

# Review changes
git diff

# Commit all changes (if not already committed)
git add .
git commit -m "feat: Add JD sharing, login status detection, and deployment updates"
```

### Step 2: Deploy Backend to Render

1. **Go to Render Dashboard** → Your Web Service (or create new)

2. **Verify Configuration:**
   - **Build Command:** `npm install && npm run build:backend`
   - **Start Command:** `npm run start:backend`
   - **Node Version:** 20 (or latest LTS)

3. **Set Environment Variables:**
   - Go to **Environment** tab
   - Add ALL required variables from above
   - **Generate SESSION_SECRET:**
     ```bash
     openssl rand -hex 32
     ```
   - Copy the output to `SESSION_SECRET` variable

4. **Connect Repository:**
   - Connect your GitHub repository
   - Set branch to `main` (or your default branch)

5. **Deploy:**
   - Click **Manual Deploy** → **Deploy latest commit**
   - OR push to GitHub (if auto-deploy is enabled)

6. **Wait for Deployment:**
   - Monitor build logs
   - Should see: "Build successful"
   - Should see: "Server running on port 5000"
   - Note your backend URL: `https://your-service.onrender.com`

### Step 3: Update FRONTEND_URL in Render

After backend deployment, update in Render dashboard:
```
FRONTEND_URL=https://your-vercel-project.vercel.app
```

(If you haven't deployed frontend yet, deploy it first, then update this)

### Step 4: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard** → Your Project (or create new)

2. **Import Repository:**
   - Connect your GitHub repository
   - Framework: Vite (auto-detected)

3. **Set Environment Variable:**
   - Go to **Settings** → **Environment Variables**
   - Add:
     ```
     VITE_API_URL=https://your-render-backend.onrender.com
     ```
   - **Replace** `your-render-backend.onrender.com` with your actual Render URL

4. **Deploy:**
   - Click **Deploy** (or push to GitHub if auto-deploy is enabled)
   - Vercel will automatically:
     - Run `npm install`
     - Run `npm run build:frontend`
     - Deploy to `dist/public`

5. **Note Your Vercel URL:**
   - Should be: `https://your-project.vercel.app`
   - Update `FRONTEND_URL` in Render if needed

### Step 5: Verify Database Schema

After backend is deployed, ensure database schema is up-to-date:

1. **Connect to Production Database:**
   ```bash
   # Using DATABASE_URL from Render
   export DATABASE_URL="your-production-database-url"
   npm run db:push
   ```

2. **Or manually verify:**
   - Check that `session` table exists (created automatically)
   - Check that all required tables exist
   - Verify `requirements` table has `jdFile` and `jdText` columns

### Step 6: Test Deployment

1. **Test Backend Health:**
   ```
   GET https://your-render-backend.onrender.com/api/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Test Frontend:**
   - Visit: `https://your-vercel-project.vercel.app`
   - Should load without errors
   - Check browser console (F12) for errors

3. **Test Authentication:**
   - Try logging in
   - Verify sessions work
   - Test protected routes

4. **Test New Features:**
   - JD sharing feature
   - Status column (login detection)
   - Active sessions endpoint

---

## 🔍 Common Issues & Solutions

### Issue 1: CORS Errors

**Symptoms:** Browser console shows CORS errors  
**Solution:** 
- Verify `FRONTEND_URL` in Render matches Vercel URL exactly
- Check `VITE_API_URL` in Vercel points to Render backend
- Ensure no trailing slashes in URLs

### Issue 2: Session Not Working

**Symptoms:** Logged out immediately, sessions don't persist  
**Solution:**
- Verify `SESSION_SECRET` is set and at least 32 chars
- Check `DATABASE_URL` is correct and database is accessible
- Ensure `session` table exists in database
- Verify cookie settings (secure, sameSite) match environment

### Issue 3: Build Fails on Render

**Symptoms:** Build command fails  
**Solution:**
- Check Node version (should be 20+)
- Verify `render.yaml` build command is correct
- Check build logs for specific errors
- Ensure all dependencies are in `package.json`

### Issue 4: Frontend Can't Connect to Backend

**Symptoms:** Network errors, API calls fail  
**Solution:**
- Verify `VITE_API_URL` in Vercel is correct
- Check Render backend is running (check health endpoint)
- Verify CORS is configured correctly
- Check Render backend logs for errors

### Issue 5: Database Connection Fails

**Symptoms:** Database errors, connection refused  
**Solution:**
- Verify `DATABASE_URL` format is correct
- Ensure SSL mode is included for cloud databases
- Check database credentials are correct
- Verify database is accessible from Render's IP

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads without console errors
- [ ] Login/authentication works
- [ ] Sessions persist across page refreshes
- [ ] API calls work (check Network tab)
- [ ] Database operations work
- [ ] File uploads work (if applicable)
- [ ] New features work (JD sharing, Status column)
- [ ] No hardcoded localhost URLs in production
- [ ] Environment variables are set correctly

---

## 📞 Quick Reference

### Generate Secrets

```bash
# Generate SESSION_SECRET
openssl rand -hex 32

# Generate ADMIN_RESET_KEY (optional)
openssl rand -hex 16
```

### Test Backend Locally (Production Mode)

```bash
# Build
npm run build

# Start production server
NODE_ENV=production npm start
```

### Check Environment Variables

```bash
# Check if .env is in .gitignore (should be)
cat .gitignore | grep .env
```

---

## 🎯 Final Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use different secrets** for production vs development
3. **Monitor logs** in both Vercel and Render dashboards
4. **Test thoroughly** after deployment
5. **Keep environment variables** synchronized between services

---

**Status:** ✅ **READY FOR DEPLOYMENT**

All checks passed. You can proceed with deployment to Vercel and Render.
