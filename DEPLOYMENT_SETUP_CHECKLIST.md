# Production Deployment Setup Checklist
## Complete Setup Guide for Enterprise Production Deployment

Use this checklist to set up your production deployment infrastructure step by step.

---

## 📋 Pre-Setup Requirements

- [ ] GitHub repository is set up and accessible
- [ ] You have admin access to the repository
- [ ] You have accounts for:
  - [ ] Render.com
  - [ ] Vercel.com
  - [ ] Neon.tech
- [ ] You have a domain name (optional but recommended)

---

## 1. Database Setup (Neon PostgreSQL)

### Development Database
- [ ] Go to [neon.tech](https://neon.tech)
- [ ] Create project: `staffos-dev`
- [ ] Select region closest to your development team
- [ ] Copy connection string
- [ ] Save securely: `DATABASE_URL_DEV`

### Staging Database
- [ ] Create project: `staffos-staging`
- [ ] Select same region as dev
- [ ] Copy connection string
- [ ] Save securely: `DATABASE_URL_STAGING`

### Production Database
- [ ] Create project: `staffos-production`
- [ ] Select region closest to your users
- [ ] Choose appropriate plan (Scale recommended)
- [ ] Enable automatic backups
- [ ] Copy connection string
- [ ] Save securely: `DATABASE_URL_PRODUCTION`
- [ ] Verify SSL mode: `?sslmode=require`

### Run Initial Migrations
- [ ] Run migration on dev database
  ```bash
  DATABASE_URL="<dev-url>" npm run db:push
  ```
- [ ] Run migration on staging database
  ```bash
  DATABASE_URL="<staging-url>" npm run db:push
  ```
- [ ] Run migration on production database
  ```bash
  DATABASE_URL="<production-url>" npm run db:push
  ```

---

## 2. Backend Setup (Render.com)

### Development Backend Service
- [ ] Go to [render.com](https://render.com)
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure:
  - [ ] Name: `staffos-backend-dev`
  - [ ] Branch: `dev`
  - [ ] Region: Same as dev database
  - [ ] Plan: Starter ($7/mo) or Free
  - [ ] Build Command: `npm install && npm run build:backend`
  - [ ] Start Command: `npm run start:backend`
  - [ ] Health Check Path: `/api/health`
- [ ] Add Environment Variables:
  - [ ] `NODE_ENV=production`
  - [ ] `NODE_VERSION=20.10.0`
  - [ ] `DATABASE_URL=<dev-database-url>`
  - [ ] `SESSION_SECRET=<generate-random-32-chars>`
  - [ ] `FRONTEND_URL=https://staffos-dev.vercel.app` (update after frontend setup)
- [ ] Enable Auto-Deploy
- [ ] Save and deploy
- [ ] Verify deployment: `https://staffos-backend-dev.onrender.com/api/health`

### Staging Backend Service
- [ ] Create new web service
- [ ] Configure:
  - [ ] Name: `staffos-backend-staging`
  - [ ] Branch: `staging`
  - [ ] Same settings as dev
- [ ] Add Environment Variables (use staging database)
- [ ] Enable Auto-Deploy
- [ ] Verify deployment

### Production Backend Service
- [ ] Create new web service
- [ ] Configure:
  - [ ] Name: `staffos-backend`
  - [ ] Branch: `main`
  - [ ] Region: Same as production database
  - [ ] Plan: Standard ($25/mo) or higher for production
  - [ ] Same build/start commands
- [ ] Add Environment Variables (use production database)
- [ ] Enable Auto-Deploy (will be controlled by CI/CD)
- [ ] Set up custom domain (optional): `api.staffos.com`
- [ ] Verify deployment

---

## 3. Frontend Setup (Vercel)

### Development Frontend
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "Add New" → "Project"
- [ ] Import GitHub repository
- [ ] Configure:
  - [ ] Framework Preset: Vite
  - [ ] Root Directory: `Candidate-Dashboard`
  - [ ] Build Command: `npm run build:frontend`
  - [ ] Output Directory: `dist/public`
  - [ ] Install Command: `npm install`
- [ ] Add Environment Variables:
  - [ ] `VITE_API_URL=https://staffos-backend-dev.onrender.com`
- [ ] Configure Git:
  - [ ] Production Branch: `main`
  - [ ] Preview Branches: Enable for `dev` and `staging`
- [ ] Deploy
- [ ] Note the URL: `https://staffos-dev.vercel.app`

### Staging Frontend
- [ ] In same Vercel project, go to Settings → Environment Variables
- [ ] Add variable for Preview environment:
  - [ ] `VITE_API_URL=https://staffos-backend-staging.onrender.com`
- [ ] Configure branch: `staging` → Preview deployment
- [ ] Verify staging URL works

### Production Frontend
- [ ] In Vercel project, go to Settings → Environment Variables
- [ ] Add variable for Production environment:
  - [ ] `VITE_API_URL=https://staffos-backend.onrender.com`
- [ ] Configure Production Branch: `main`
- [ ] Set up custom domain (optional): `app.staffos.com`
- [ ] Verify production URL works

---

## 4. Update Backend CORS Settings

### Development Backend
- [ ] Go to Render → `staffos-backend-dev` → Environment
- [ ] Update `FRONTEND_URL` to actual Vercel dev URL
- [ ] Save (triggers redeploy)

### Staging Backend
- [ ] Update `FRONTEND_URL` to staging Vercel URL
- [ ] Save

### Production Backend
- [ ] Update `FRONTEND_URL` to production Vercel URL
- [ ] Save

---

## 5. GitHub Repository Setup

### Branch Protection Rules

#### Main Branch (Production)
- [ ] Go to Settings → Branches → Add rule
- [ ] Branch name pattern: `main`
- [ ] Enable:
  - [ ] Require a pull request before merging
    - [ ] Require approvals: 2
    - [ ] Dismiss stale pull request approvals
  - [ ] Require status checks to pass before merging
    - [ ] Require branches to be up to date
  - [ ] Require linear history
  - [ ] Do not allow bypassing the above settings
- [ ] Save

#### Staging Branch
- [ ] Add rule for `staging`
- [ ] Enable:
  - [ ] Require a pull request before merging
    - [ ] Require approvals: 1
  - [ ] Require status checks to pass
- [ ] Save

#### Dev Branch
- [ ] Add rule for `dev`
- [ ] Enable:
  - [ ] Require status checks to pass
- [ ] Save

### GitHub Actions Setup
- [ ] Verify `.github/workflows/deploy.yml` exists
- [ ] Go to Settings → Actions → General
- [ ] Enable:
  - [ ] Allow all actions and reusable workflows
  - [ ] Allow GitHub Actions to create and approve pull requests
- [ ] Go to Settings → Secrets and variables → Actions
- [ ] Add secrets if needed (for notifications, etc.)

---

## 6. CI/CD Pipeline Verification

### Test Development Deployment
- [ ] Make a small change to `dev` branch
- [ ] Push to GitHub
- [ ] Verify GitHub Actions runs
- [ ] Check deployment succeeds
- [ ] Verify backend is accessible
- [ ] Verify frontend is accessible

### Test Staging Deployment
- [ ] Create PR: `dev` → `staging`
- [ ] Merge PR
- [ ] Verify staging deployment
- [ ] Test staging environment

### Test Production Deployment (Dry Run)
- [ ] Create PR: `staging` → `main`
- [ ] Verify 2 approvals required
- [ ] Do NOT merge yet
- [ ] Verify all checks pass

---

## 7. Monitoring Setup

### Render Monitoring
- [ ] Enable logs in Render dashboard
- [ ] Set up email notifications for deployments
- [ ] Configure uptime monitoring (optional)

### Vercel Monitoring
- [ ] Enable Analytics in Vercel
- [ ] Set up deployment notifications
- [ ] Configure error tracking (optional)

### External Monitoring (Recommended)
- [ ] Set up Uptime Robot or similar
  - [ ] Monitor: `https://staffos-backend.onrender.com/api/health`
  - [ ] Monitor: `https://staffos.vercel.app`
  - [ ] Set up alerts

### Error Tracking (Recommended)
- [ ] Set up Sentry account
- [ ] Configure Sentry for backend
- [ ] Configure Sentry for frontend
- [ ] Test error reporting

---

## 8. Security Setup

### Environment Variables Security
- [ ] Verify no secrets in code
- [ ] All secrets in environment variables
- [ ] Different secrets for each environment
- [ ] Strong SESSION_SECRET generated

### OAuth Setup (If Using)
- [ ] Create separate OAuth apps for dev/staging/prod
- [ ] Configure redirect URIs correctly
- [ ] Store credentials securely

### Email Service Setup (If Using)
- [ ] Set up Resend account
- [ ] Create separate API keys for each environment
- [ ] Configure domain (if using custom domain)

### Database Security
- [ ] Verify SSL connections only
- [ ] Connection pooling enabled
- [ ] Backups enabled
- [ ] Access logging enabled

---

## 9. Documentation

### Internal Documentation
- [ ] Deployment guide created
- [ ] Daily workflow documented
- [ ] Team access documented
- [ ] Emergency procedures documented

### Runbooks
- [ ] Rollback procedure documented
- [ ] Database migration procedure documented
- [ ] Troubleshooting guide created
- [ ] Contact information documented

---

## 10. Team Access & Permissions

### GitHub
- [ ] Team members have appropriate access
- [ ] Reviewers assigned
- [ ] Admin access limited

### Render
- [ ] Team members added (if needed)
- [ ] Appropriate permissions set

### Vercel
- [ ] Team members added (if needed)
- [ ] Appropriate permissions set

### Neon
- [ ] Database access configured
- [ ] Team members have access (if needed)

---

## 11. Initial Production Deployment

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Team notified

### Deployment
- [ ] Create PR: `staging` → `main`
- [ ] Get 2 approvals
- [ ] Merge PR
- [ ] Monitor deployment
- [ ] Verify health checks pass

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Monitor for 30 minutes
- [ ] Check error logs
- [ ] Verify all features work
- [ ] Team notified of success

---

## 12. Verification Tests

### Backend Health Checks
```bash
# Development
curl https://staffos-backend-dev.onrender.com/api/health

# Staging
curl https://staffos-backend-staging.onrender.com/api/health

# Production
curl https://staffos-backend.onrender.com/api/health
```

### Frontend Tests
- [ ] Development frontend loads
- [ ] Staging frontend loads
- [ ] Production frontend loads
- [ ] API connectivity works
- [ ] Authentication works
- [ ] Core features work

### Database Tests
- [ ] Can connect to dev database
- [ ] Can connect to staging database
- [ ] Can connect to production database
- [ ] Schema is correct
- [ ] Migrations applied

---

## ✅ Final Checklist

- [ ] All three environments set up
- [ ] All deployments working
- [ ] CI/CD pipeline functional
- [ ] Monitoring configured
- [ ] Security measures in place
- [ ] Documentation complete
- [ ] Team trained on workflow
- [ ] Production deployment successful
- [ ] Rollback procedure tested

---

## 🎉 Setup Complete!

Once all items are checked, your production deployment infrastructure is ready!

### Next Steps:
1. Train team on daily workflow
2. Schedule regular deployment reviews
3. Set up regular backups
4. Plan for scaling (if needed)
5. Monitor performance and optimize

---

## 📞 Support Contacts

- **Render Support**: support@render.com
- **Vercel Support**: support@vercel.com
- **Neon Support**: support@neon.tech
- **GitHub Support**: https://support.github.com

---

**Last Updated**: 2024
**Status**: Ready for Production Use

