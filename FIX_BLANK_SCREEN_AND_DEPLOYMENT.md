# Fix Blank Screen & Deployment Readiness

## 🔴 Immediate Fix for Blank Screen

The 404 error for `my-jobs-tab.tsx` is a Vite HMR cache issue. Follow these steps:

### Step 1: Stop the Dev Server
Press `Ctrl+C` in the terminal where the dev server is running.

### Step 2: Clear Vite Cache
Run these commands in PowerShell:

```powershell
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

### Step 3: Restart Dev Server
```powershell
npm run dev
```

### Step 4: Hard Refresh Browser
- Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- Or open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

---

## ✅ Deployment Readiness Checklist

### 1. **Environment Variables Setup**

#### For Vercel (Frontend):
- `VITE_API_URL` - Your backend API URL (e.g., `https://your-app.onrender.com`)

#### For Render (Backend):
- `NODE_ENV=production`
- `DATABASE_URL` - Your Neon/PostgreSQL connection string
- `SESSION_SECRET` - Random secure string (Render can generate this)
- `FRONTEND_URL` - Your Vercel frontend URL
- `GOOGLE_CLIENT_ID` - If using Google OAuth
- `GOOGLE_CLIENT_SECRET` - If using Google OAuth
- `RESEND_API_KEY` - For email functionality (if using Resend)

### 2. **Pre-Deployment Steps**

#### Build Test (Run Locally):
```bash
# Test frontend build
npm run build:frontend

# Test backend build
npm run build:backend

# Test full build
npm run build
```

#### Database Migration:
```bash
# Push schema changes to production database
npm run db:push
```

### 3. **Vercel Deployment (Frontend)**

1. **Connect Repository** to Vercel
2. **Configure Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build:frontend`
   - Output Directory: `dist/public`
   - Install Command: `npm install`
3. **Environment Variables**:
   - Add `VITE_API_URL` with your Render backend URL
4. **Deploy**

### 4. **Render Deployment (Backend)**

1. **Create New Web Service** in Render
2. **Connect Repository**
3. **Configure Settings**:
   - Build Command: `npm install && npm run build:backend`
   - Start Command: `npm run start:backend`
   - Health Check Path: `/api/health`
4. **Environment Variables**:
   - Add all required variables from section 1
5. **Deploy**

### 5. **Post-Deployment Verification**

- [ ] Frontend loads without errors
- [ ] Backend API responds at `/api/health`
- [ ] Database connection works
- [ ] Authentication flows work
- [ ] File uploads work (if applicable)
- [ ] Email sending works (if applicable)

### 6. **Important Notes**

- **CORS**: Backend must allow requests from Vercel frontend URL
- **Database**: Ensure production database is accessible from Render
- **File Storage**: If using local uploads, consider cloud storage (S3, Cloudinary) for production
- **Session Storage**: Ensure session secret is set and consistent

---

## 🚨 Common Issues & Fixes

### Issue: Blank Screen After Deployment
- **Fix**: Check browser console for errors
- **Fix**: Verify `VITE_API_URL` is set correctly in Vercel
- **Fix**: Check CORS settings in backend

### Issue: 404 Errors
- **Fix**: Ensure `vercel.json` rewrites are configured
- **Fix**: Check build output directory matches Vercel settings

### Issue: Database Connection Errors
- **Fix**: Verify `DATABASE_URL` is set in Render
- **Fix**: Check database allows connections from Render IPs
- **Fix**: Run `npm run db:push` to sync schema

### Issue: Environment Variables Not Working
- **Fix**: Restart services after adding env vars
- **Fix**: Frontend env vars must start with `VITE_`
- **Fix**: Backend env vars are accessed via `process.env`

---

## 📝 Quick Deployment Commands

```bash
# 1. Test builds locally
npm run build:frontend
npm run build:backend

# 2. Push database schema
npm run db:push

# 3. Commit and push to Git
git add .
git commit -m "Ready for deployment"
git push

# 4. Deploy to Vercel (via dashboard or CLI)
vercel --prod

# 5. Deploy to Render (via dashboard)
# Just push to main branch if auto-deploy is enabled
```

---

## ✅ Final Checklist Before Deploying

- [ ] All builds succeed locally
- [ ] No TypeScript errors (or acceptable warnings)
- [ ] Database schema is up to date
- [ ] Environment variables are configured
- [ ] CORS is properly configured
- [ ] Health check endpoint works
- [ ] Test authentication flow
- [ ] Test critical features
- [ ] Check error logs in both services

---

**Note**: The WebSocket errors you see in the console are normal for Vite HMR (Hot Module Replacement) and don't affect production builds.

