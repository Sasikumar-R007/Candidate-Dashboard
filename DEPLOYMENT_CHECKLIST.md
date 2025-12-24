# StaffOS - Complete Deployment Analysis & Environment Variables Guide

**Analysis Date:** December 24, 2025  
**Project:** rest-express (Node.js 20, Express, React, Drizzle ORM, PostgreSQL)

---

## ✅ DEPLOYMENT READINESS STATUS

### Overall Status: **READY FOR DEPLOYMENT** ✓

Your project is properly configured for production deployment on both **Vercel** (frontend) and **Render** (backend).

---

## 🏗️ PROJECT ARCHITECTURE

```
Frontend (Vercel)          Backend (Render)           Database
    ↓                           ↓                         ↓
React + Vite    ←API calls→  Express.js    ←→  PostgreSQL + Drizzle ORM
vite.dev        ←CORS→       Node.js 20         (+ Session Storage)
dist/           ←Sessions→   Port 5000         (+ Google OAuth)
```

---

## 📦 BUILD & RUN CONFIGURATION

### Build Command
```bash
npm run build
```
Outputs:
- `dist/` - Frontend static files (for Vercel)
- `dist/index.js` - Backend bundle (for Render)

### Production Start Command
```bash
npm start
# OR
node dist/index.js
```

### Development Command
```bash
npm run dev
```

---

## 🌍 COMPLETE ENVIRONMENT VARIABLES FOR DEPLOYMENT

### **VERCEL FRONTEND** (Build-time Variables)

Set these in Vercel Project Settings → Environment Variables:

```env
# Required
VITE_API_URL=https://your-render-backend.onrender.com
```

**Note:** Vercel will automatically set `NODE_ENV=production` during build.

---

### **RENDER BACKEND** (Runtime Variables)

Set all these in Render Service Settings → Environment Variables:

#### **1. DATABASE & SESSION (CRITICAL)**
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SESSION_SECRET=your-super-secret-key-min-32-chars
```

**Examples:**
- `DATABASE_URL=postgresql://admin:password123@db.neon.tech:5432/staffos_prod`
- `SESSION_SECRET=7f3b9e2d1a4c6f8e5b2a9c4d7e1f3a5b` *(generate with `openssl rand -hex 32`)*

**⚠️ CRITICAL:** 
- `DATABASE_URL` must include SSL settings
- `SESSION_SECRET` must be different from development

#### **2. FRONTEND & BACKEND URLS (CRITICAL)**
```env
FRONTEND_URL=https://your-vercel-project.vercel.app
BACKEND_URL=https://your-render-backend.onrender.com
```

**How to find:**
- `FRONTEND_URL` - Your Vercel deployed URL (Settings → Domains)
- `BACKEND_URL` - Your Render service URL (after deployment)

**Used for:**
- `FRONTEND_URL` → CORS validation, preventing unauthorized requests
- `BACKEND_URL` → Email links, OAuth redirects, password reset links

#### **3. GOOGLE OAUTH (Optional - for Social Login)**
```env
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrst.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://your-render-backend.onrender.com/api/auth/google/callback
```

**How to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (Web Application)
3. Add authorized redirect URI: `https://your-render-backend.onrender.com/api/auth/google/callback`

**⚠️ CRITICAL:** 
- Callback URL must match exactly
- Keep `GOOGLE_CLIENT_SECRET` private (never in code)

#### **4. EMAIL SERVICE - RESEND (Optional - for Sending Emails)**
```env
RESEND_API_KEY=re_1234567890abcdefghijklmn
FROM_EMAIL=StaffOS <noreply@yourdomain.com>
```

**How to get:**
1. Sign up at [Resend.com](https://resend.com)
2. Get API key from dashboard
3. Verify domain ownership

**Format:** `"Display Name <email@domain>"`

**⚠️ Note:** If not configured, email features will log warnings but won't crash.

#### **5. ADMIN FEATURES (Optional)**
```env
ADMIN_RESET_KEY=secure-random-admin-reset-key-here
```

Used for admin password reset functionality. Generate a random string.

#### **6. RUNTIME CONFIGURATION**
```env
NODE_ENV=production
PORT=5000
```

**Important:**
- `NODE_ENV=production` → Enables security features, disables hot-reload
- `PORT=5000` → Render will auto-assign, but backend expects this

---

## 📋 QUICK COPY-PASTE TEMPLATE

Use this template to collect all variables for Render:

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:port/dbname
SESSION_SECRET=your-random-key-here

# URLs (REQUIRED)
FRONTEND_URL=https://your-vercel-project.vercel.app
BACKEND_URL=https://your-render-backend.onrender.com

# Google OAuth (OPTIONAL)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://your-render-backend.onrender.com/api/auth/google/callback

# Email (OPTIONAL)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=StaffOS <noreply@yourdomain.com>

# Admin (OPTIONAL)
ADMIN_RESET_KEY=your-admin-reset-key

# Runtime
NODE_ENV=production
PORT=5000
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT GUIDE

### **Step 1: Database Setup (Render or Neon)**

1. Create PostgreSQL database on [Render](https://render.com) or [Neon](https://neon.tech)
2. Get connection string: `postgresql://user:pass@host:port/db`
3. Add to Render: `DATABASE_URL` environment variable

**Test connection:**
```bash
psql "your-database-url"
```

### **Step 2: Deploy Backend on Render**

1. Create Render account and new Web Service
2. Connect GitHub repository
3. Configure:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
   - **Node version:** 20 (if option available)
4. Add **ALL** environment variables from section above
5. Click Deploy
6. **Note the URL:** `https://your-render-backend.onrender.com`

### **Step 3: Generate SESSION_SECRET**

```bash
# In terminal, run:
openssl rand -hex 32
# Copy the output to RENDER environment variables
```

### **Step 4: Update Render Environment**

After getting Render URL, update in Render dashboard:
```
BACKEND_URL=https://your-render-backend.onrender.com
```

### **Step 5: Deploy Frontend on Vercel**

1. Go to [Vercel](https://vercel.com) and import your GitHub repo
2. Add environment variable:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com
   ```
3. Vercel auto-detects `npm run build` - no changes needed
4. Click Deploy
5. **Note the URL:** `https://your-vercel-project.vercel.app`

### **Step 6: Final Backend Configuration**

Update Render environment with frontend URL:
```
FRONTEND_URL=https://your-vercel-project.vercel.app
```

### **Step 7: Database Migrations**

After first backend deployment:
```bash
npm run db:push
# This creates database tables from your schema
```

---

## 🔍 VERIFYING DEPLOYMENT

### Health Check Endpoint
```bash
curl https://your-render-backend.onrender.com/api/auth/verify-session
# Expected response: {"authenticated":false}
```

### Check CORS is Working
```bash
curl -H "Origin: https://your-vercel-project.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     https://your-render-backend.onrender.com/api/auth/login
```

### Test Database Connection
```bash
# In Render logs, you should see:
# "Backend server running on http://0.0.0.0:5000"
```

---

## ⚠️ CRITICAL PRODUCTION CHECKLIST

- [ ] **DATABASE_URL** is set and uses SSL
- [ ] **SESSION_SECRET** changed from default and secure (32+ chars)
- [ ] **FRONTEND_URL** points to Vercel domain
- [ ] **BACKEND_URL** points to Render domain
- [ ] **NODE_ENV=production** in Render
- [ ] **Google OAuth** callback URL registered in Google Console
- [ ] **RESEND_API_KEY** added if using email
- [ ] Backend health check endpoint working
- [ ] Frontend can make API calls to backend
- [ ] Sessions persist across page reloads
- [ ] Render logs show no errors

---

## 🐛 TROUBLESHOOTING

### Issue: "Google OAuth not configured"
**Solution:** Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to Render environment

### Issue: CORS errors - "Access denied"
**Solution:** Update `FRONTEND_URL` in Render to match Vercel domain exactly

### Issue: Frontend can't reach backend
**Check:**
1. Is Render backend deployed and running?
2. Is `VITE_API_URL` correct in Vercel?
3. Are CORS headers being sent? (Check browser Network tab)

### Issue: Database connection failed
**Solutions:**
- Check `DATABASE_URL` format is correct
- Verify database is accessible from Render IP
- Ensure SSL is enabled on connection string
- Check database user has correct permissions

### Issue: "Session table does not exist"
**Solution:** Run `npm run db:push` after first deployment

### Issue: Email not sending
**Solutions:**
- Verify `RESEND_API_KEY` is valid
- Check `FROM_EMAIL` matches verified domain in Resend
- Look for "403 Unauthorized" in logs

---

## 📊 CONFIGURATION REFERENCE

### Session Store
- **Type:** PostgreSQL (`connect-pg-simple`)
- **Table:** `session` (auto-created)
- **Expires:** 24 hours
- **Secure:** HTTPS only in production

### CORS Rules
```typescript
// Production allows:
- *.vercel.app (Vercel preview deployments)
- FRONTEND_URL (your custom domain)
- localhost:* (fallback for local testing)
```

### Database Pool
- **Production:** 10 connections
- **Development:** 5 connections
- **Timeout:** Default PostgreSQL timeout

### Frontend Build
- **Build tool:** Vite
- **Output:** Static files in `dist/`
- **Caching:** Content-hash in filenames
- **Optimization:** Tree-shaking, code splitting

---

## 🎯 QUICK VERIFICATION CHECKLIST

Before considering deployment complete, verify:

```bash
# 1. Can you log in with credentials?
# 2. Can you upload resume/files?
# 3. Do emails send (if configured)?
# 4. Do sessions persist after refresh?
# 5. Can you use Google OAuth (if configured)?
# 6. Are database records saving?
# 7. Do all pages load without errors?
# 8. Can you navigate to all routes?
```

---

## 📝 ENVIRONMENT VARIABLES SUMMARY TABLE

| Variable | Render | Vercel | Required | Type | Example |
|----------|--------|--------|----------|------|---------|
| DATABASE_URL | ✓ | ✗ | Yes | Secret | `postgresql://...` |
| SESSION_SECRET | ✓ | ✗ | Yes | Secret | `7f3b9e2d1a4c...` |
| FRONTEND_URL | ✓ | ✗ | Yes | Env | `https://app.vercel.app` |
| BACKEND_URL | ✓ | ✗ | Yes | Env | `https://api.onrender.com` |
| GOOGLE_CLIENT_ID | ✓ | ✗ | No | Secret | `1234567890-abc...` |
| GOOGLE_CLIENT_SECRET | ✓ | ✗ | No | Secret | `GOCSPX-xxx...` |
| GOOGLE_CALLBACK_URL | ✓ | ✗ | No | Env | `https://api.onrender.com/...` |
| RESEND_API_KEY | ✓ | ✗ | No | Secret | `re_1234567890...` |
| FROM_EMAIL | ✓ | ✗ | No | Env | `StaffOS <...>` |
| ADMIN_RESET_KEY | ✓ | ✗ | No | Secret | `secure-key-here` |
| NODE_ENV | ✓ | ✗ | Yes | Env | `production` |
| PORT | ✓ | ✗ | Auto | Env | `5000` |
| VITE_API_URL | ✗ | ✓ | Yes | Env | `https://api.onrender.com` |

---

## 🔗 Useful Links

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Express.js](https://expressjs.com)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Resend Email Service](https://resend.com)
- [PostgreSQL SSL](https://www.postgresql.org/docs/current/ssl-tcp.html)

---

**Last Updated:** December 24, 2025  
**Status:** ✅ Ready for Production Deployment
