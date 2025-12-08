# StaffOS Deployment Guide

This project is configured and ready for deployment on:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon PostgreSQL

---

## Quick Start Deployment

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

---

## Database Setup (Neon)

### 1. Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech) and sign up
2. Click **"Create a project"**
3. Name it: `staffos-db`
4. Select region: Choose closest to your users
5. Copy the **Connection string** (save it securely)

### 2. Push Schema to Neon

Run this command with your Neon connection string:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require" npm run db:push
```

---

## Backend Deployment (Render)

### 1. Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2. Deploy Using Dashboard

1. Click **"New +"** > **"Web Service"**
2. Connect your GitHub repository
3. Configure settings:

| Setting | Value |
|---------|-------|
| **Name** | `staffos-backend` |
| **Environment** | `Node` |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build:backend` |
| **Start Command** | `npm run start:backend` |
| **Instance Type** | `Starter` or `Free` |

### 3. Add Environment Variables

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string |
| `SESSION_SECRET` | Generate a secure 32+ character string |
| `FRONTEND_URL` | `https://your-app.vercel.app` (add after Vercel deploy) |

### 4. Deploy

Click **"Create Web Service"** and wait for deployment.

Your backend URL will be: `https://staffos-backend.onrender.com`

---

## Frontend Deployment (Vercel)

### 1. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2. Deploy

1. Click **"Add New..."** > **"Project"**
2. Import your GitHub repository
3. Vercel auto-detects Vite - verify settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build:frontend` |
| **Output Directory** | `dist/public` |

### 3. Add Environment Variables (Required)

The `vercel.json` uses environment variables for API routing. Add these:

| Variable | Value | Description |
|----------|-------|-------------|
| `BACKEND_URL` | `https://staffos-backend.onrender.com` | Your Render backend URL (used for API rewrites) |
| `VITE_API_URL` | `https://staffos-backend.onrender.com` | Backend URL for client-side requests |

### 4. Deploy

Click **"Deploy"** and wait for build.

Your frontend URL will be: `https://your-project.vercel.app`

---

## Post-Deployment Configuration

### Update Render with Frontend URL

1. Go to Render Dashboard > Your Service > Environment
2. Update `FRONTEND_URL` to your Vercel URL
3. Click **"Save Changes"**

---

## Environment Variables Summary

### Neon Database
No environment variables needed - just the connection string.

### Render (Backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secure random string (32+ chars) |
| `FRONTEND_URL` | Yes | Your Vercel frontend URL |
| `PORT` | No | Render sets this automatically |

### Vercel (Frontend)

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | Yes | Render backend URL (for API rewrites) |
| `VITE_API_URL` | Yes | Backend URL for client-side API requests |

---

## Verification Checklist

After deployment, verify these endpoints work:

- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Health check: `https://your-backend.onrender.com/api/health`
- [ ] API connection: Login/register functionality works

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
- No trailing slash

### Database Connection Failed
- Verify Neon connection string includes `?sslmode=require`
- Check if Neon database is awake (free tier hibernates)

### API Calls Return 404
- Ensure `BACKEND_URL` environment variable is set in Vercel
- Ensure Render service is running

### Session/Cookie Issues
- Set `SESSION_SECRET` in Render
- Both frontend and backend must use HTTPS

### Cold Starts (Free Tier)
- Render free tier spins down after 15 min inactivity
- First request after inactivity takes 30-60 seconds

---

## File Structure Reference

```
/
├── client/               # Frontend (React + Vite)
│   ├── src/
│   └── index.html
├── server/               # Backend (Express)
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── db.ts            # Database connection
│   └── storage.ts       # Data layer
├── shared/
│   └── schema.ts        # Drizzle ORM schema
├── vercel.json          # Vercel configuration
├── render.yaml          # Render configuration
└── drizzle.config.ts    # Database configuration
```

---

## Commands Reference

```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend

# Push database schema
npm run db:push

# Start production server locally
npm run start:backend
```

---

## Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Test the health endpoint: `/api/health`
