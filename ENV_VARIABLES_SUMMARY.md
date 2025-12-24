# Environment Variables - Quick Reference for Vercel & Render

## 🟦 RENDER Backend Environment Variables

Copy and paste this into your **Render Service Settings → Environment → Custom Environment Variables**:

### **REQUIRED Variables (Won't work without these)**
```
DATABASE_URL=postgresql://user:password@host:port/dbname
SESSION_SECRET=your-random-secret-key-minimum-32-characters
FRONTEND_URL=https://your-vercel-project.vercel.app
BACKEND_URL=https://your-render-service.onrender.com
NODE_ENV=production
PORT=5000
```

### **OPTIONAL Variables (For Google OAuth)**
```
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=https://your-render-service.onrender.com/api/auth/google/callback
```

### **OPTIONAL Variables (For Email Functionality)**
```
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=StaffOS <noreply@yourdomain.com>
```

### **OPTIONAL Variables (For Admin Features)**
```
ADMIN_RESET_KEY=secure-random-admin-reset-key
```

---

## 🔷 VERCEL Frontend Environment Variables

Copy and paste this into your **Vercel Project Settings → Environment Variables**:

```
VITE_API_URL=https://your-render-service.onrender.com
```

**That's it!** Vercel auto-sets `NODE_ENV=production` during build.

---

## 📋 Variable Descriptions & How to Get Them

### DATABASE_URL
**What:** PostgreSQL connection string  
**Where to get:** 
- Render: Create database in Render dashboard
- Neon: Create database at neon.tech
- Format: `postgresql://user:password@host:port/dbname`

### SESSION_SECRET
**What:** Random key for encrypting session cookies  
**Generate with:** 
```bash
openssl rand -hex 32
```
**Must be:** 32+ characters, unique, kept secret

### FRONTEND_URL
**What:** Your Vercel app URL  
**Where to get:** Vercel Project Settings → Domains  
**Format:** `https://your-project.vercel.app`

### BACKEND_URL
**What:** Your Render backend URL  
**Where to get:** After deploying to Render, visible in dashboard  
**Format:** `https://your-service.onrender.com`

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
**What:** OAuth credentials for Google login  
**Where to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Web Application credentials
3. Add authorized redirect: `https://your-render-service.onrender.com/api/auth/google/callback`

### GOOGLE_CALLBACK_URL
**What:** Where Google redirects after login  
**Format:** `https://your-render-service.onrender.com/api/auth/google/callback`  
**Must match:** Exactly as registered in Google Console

### RESEND_API_KEY
**What:** API key for Resend email service  
**Where to get:**
1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Verify domain ownership

### FROM_EMAIL
**What:** Email sender address  
**Format:** `StaffOS <noreply@yourdomain.com>`  
**Must match:** Verified domain in Resend

### ADMIN_RESET_KEY
**What:** Secure token for admin password resets  
**Generate:** Any random secure string  
**Usage:** Optional, for admin features

### NODE_ENV
**What:** Deployment environment flag  
**Value:** `production` (always)  
**Effect:** Enables security features, disables hot-reload

### PORT
**What:** Server port  
**Value:** `5000` (always)  
**Render auto-assigns:** But backend expects 5000

### VITE_API_URL
**What:** Frontend API endpoint  
**Format:** `https://your-render-service.onrender.com`  
**Used during:** Build time (Vercel)

---

## ✅ Checklist Before Deploying

- [ ] Have PostgreSQL database URL ready
- [ ] Generated `SESSION_SECRET` with `openssl rand -hex 32`
- [ ] Deployed Render backend and have its URL
- [ ] Deployed Vercel frontend and have its URL
- [ ] (Optional) Created Google OAuth credentials
- [ ] (Optional) Created Resend account and API key
- [ ] All environment variables added to Render
- [ ] `VITE_API_URL` added to Vercel
- [ ] Re-deployed both Vercel and Render with env vars

---

## 🔄 If You Already Deployed

**To redeploy with updated environment variables:**

### On Render:
1. Go to Service Settings → Environment
2. Add/update all environment variables
3. Click "Deploy latest commit" or push new code
4. Wait for rebuild and deployment

### On Vercel:
1. Go to Project Settings → Environment Variables
2. Add/update `VITE_API_URL`
3. Vercel auto-redeploys when env vars change
4. Or manually trigger redeploy from Deployments tab

---

## 🚨 Important Notes

1. **DATABASE_URL must have SSL** - Most cloud databases require SSL=require
2. **SESSION_SECRET must be different** from development
3. **GOOGLE_CLIENT_SECRET must stay private** - Never commit to code
4. **FRONTEND_URL must match Vercel domain exactly** - CORS will fail otherwise
5. **BACKEND_URL must match Render domain exactly** - Email links and redirects will fail otherwise

---

## 🧪 Test After Deploying

Test these to verify everything works:

```bash
# 1. Backend health check
curl https://your-render-backend.onrender.com/api/auth/verify-session
# Should return: {"authenticated":false}

# 2. CORS working
# Open frontend, check browser Console for CORS errors

# 3. Login functionality
# Try logging in with a test account

# 4. Database working
# Create a user/record and refresh page - data should persist

# 5. Email (if configured)
# Trigger a reset password email and check inbox
```

---

## ❓ Need Help?

| Problem | Check |
|---------|-------|
| Can't connect to database | `DATABASE_URL` format, SSL enabled |
| CORS errors | `FRONTEND_URL` matches Vercel domain |
| Google OAuth fails | `GOOGLE_CALLBACK_URL` registered in Google Console |
| Email not sending | `RESEND_API_KEY` valid, `FROM_EMAIL` verified |
| Sessions lost on refresh | `SESSION_SECRET` set, database connected |

---

**Last Updated:** December 24, 2025
