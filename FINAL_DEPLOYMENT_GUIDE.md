# StaffOS Deployment Guide - Vercel + Render + Neon

Your project is ready for deployment. Follow these steps carefully.

---

## Your Database (Neon) - COMPLETED

Database URL: `postgresql://neondb_owner:npg_nEYD21petZwi@ep-late-snow-a1mrhhsz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

Database schema has been pushed successfully. No additional database setup needed.

---

## Step 1: Deploy Backend to Render

### 1.1 Create Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** > **"Web Service"**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `staffos-backend` |
| **Environment** | `Node` |
| **Region** | Oregon (US West) |
| **Build Command** | `npm install && npm run build:backend` |
| **Start Command** | `npm run start:backend` |
| **Instance Type** | Starter ($7/mo) or Free |

### 1.2 Add Environment Variables in Render

Go to **Environment** tab and add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_nEYD21petZwi@ep-late-snow-a1mrhhsz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `SESSION_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` (update after Vercel deploy) |

**Optional (for Google OAuth):**
| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |

5. Click **"Create Web Service"**
6. Wait for deployment (2-5 minutes)
7. Copy your backend URL: `https://staffos-backend.onrender.com`

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** > **"Project"**
3. Import your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (leave empty) |
| **Build Command** | Leave default (uses vercel.json) |
| **Output Directory** | Leave default (uses vercel.json) |

### 2.2 Add Environment Variables in Vercel

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://staffos-backend.onrender.com` (your Render URL) |

5. Click **"Deploy"**
6. Wait for deployment
7. Copy your frontend URL: `https://your-app.vercel.app`

---

## Step 3: Update Backend CORS (CRITICAL)

After getting your Vercel URL:

1. Go to Render Dashboard > Your Service > Environment
2. Update `FRONTEND_URL` to your actual Vercel URL (e.g., `https://staffos.vercel.app`)
3. Click **"Save Changes"** (this will redeploy automatically)

---

## Environment Variables Summary

### Render (Backend)
```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_nEYD21petZwi@ep-late-snow-a1mrhhsz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=<your-random-32-char-string>
FRONTEND_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
```

### Vercel (Frontend)
```
VITE_API_URL=https://staffos-backend.onrender.com
```

---

## Commands Reference

### Generate Session Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Push Database Schema (if needed)
```bash
DATABASE_URL="your-neon-connection-string" npm run db:push
```

### Local Development
```bash
npm run dev
```

### Build Frontend Only
```bash
npm run build:frontend
```

### Build Backend Only
```bash
npm run build:backend
```

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in Render matches your exact Vercel domain
- Must include `https://` and NO trailing slash

### Database Connection Issues
- Ensure `?sslmode=require` is at the end of DATABASE_URL
- Check that DATABASE_URL is set correctly in Render environment

### API Not Working
- Ensure `VITE_API_URL` in Vercel points to your Render backend
- Must include `https://` and NO trailing slash

### Build Failures on Render
- Ensure Build Command is: `npm install && npm run build:backend`
- Ensure Start Command is: `npm run start:backend`

### Build Failures on Vercel
- Framework preset should be "Vite"
- The vercel.json is already configured correctly

---

## Current Configuration Files

### vercel.json (CORRECT - DO NOT MODIFY)
```json
{
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### render.yaml (CORRECT - DO NOT MODIFY)
```yaml
services:
  - type: web
    name: staffos-backend
    env: node
    plan: starter
    region: oregon
    buildCommand: npm install && npm run build:backend
    startCommand: npm run start:backend
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: SESSION_SECRET
        generateValue: true
      - key: FRONTEND_URL
        sync: false
```

---

## Order of Operations

1. Deploy Render first (get backend URL)
2. Deploy Vercel with VITE_API_URL pointing to Render
3. Update Render's FRONTEND_URL with Vercel URL
4. Test the application

Your project is ready for deployment!
