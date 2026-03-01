# StaffOS Production Deployment Strategy
## Enterprise-Ready Deployment with Zero-Downtime Updates

This guide provides a comprehensive strategy for deploying StaffOS to production with the ability to make daily updates without downtime or conflicts.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   Frontend   │──────▶│   Backend    │──────▶│ Database │  │
│  │   (Vercel)   │◀──────│   (Render)   │◀──────│  (Neon)  │  │
│  │              │       │              │       │          │  │
│  └──────────────┘       └──────────────┘       └──────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STAGING ENVIRONMENT                      │
├─────────────────────────────────────────────────────────────┤
│  (Identical setup for testing before production)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT ENVIRONMENT                 │
├─────────────────────────────────────────────────────────────┤
│  (For active development and feature testing)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Table of Contents

1. [Environment Strategy](#environment-strategy)
2. [Git Branching Strategy](#git-branching-strategy)
3. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
4. [Deployment Platforms](#deployment-platforms)
5. [Daily Update Workflow](#daily-update-workflow)
6. [Zero-Downtime Deployment](#zero-downtime-deployment)
7. [Database Migration Strategy](#database-migration-strategy)
8. [Monitoring & Rollback](#monitoring--rollback)
9. [Security Best Practices](#security-best-practices)
10. [Quick Reference](#quick-reference)

---

## 1. Environment Strategy

### Three-Tier Environment Setup

#### **Development Environment**
- **Purpose**: Active development, feature building
- **Branch**: `dev`
- **Backend**: `staffos-backend-dev.onrender.com`
- **Frontend**: `staffos-dev.vercel.app` (Preview)
- **Database**: Neon DEV database
- **Auto-deploy**: Yes (on push to `dev`)

#### **Staging Environment**
- **Purpose**: Pre-production testing, QA validation
- **Branch**: `staging`
- **Backend**: `staffos-backend-staging.onrender.com`
- **Frontend**: `staffos-staging.vercel.app`
- **Database**: Neon STAGING database (separate from dev)
- **Auto-deploy**: Yes (on push to `staging`)

#### **Production Environment**
- **Purpose**: Live company use
- **Branch**: `main`
- **Backend**: `staffos-backend.onrender.com` or custom domain
- **Frontend**: `staffos.vercel.app` or custom domain
- **Database**: Neon PRODUCTION database
- **Auto-deploy**: Yes (via CI/CD with approvals)

---

## 2. Git Branching Strategy

### Branch Structure

```
main (production)
  │
  ├── staging (pre-production)
  │     │
  │     └── dev (development)
  │           │
  │           ├── feature/feature-name
  │           ├── bugfix/bug-name
  │           └── hotfix/critical-fix
```

### Branch Protection Rules

#### **main Branch (Production)**
- ✅ Require pull request reviews (2 approvals minimum)
- ✅ Require status checks to pass (CI/CD pipeline)
- ✅ Require branches to be up to date
- ✅ Require linear history
- ❌ No force pushes
- ❌ No direct commits

#### **staging Branch**
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ❌ No force pushes

#### **dev Branch**
- ✅ Require status checks to pass
- ⚠️ Force pushes allowed (for cleanup only)

---

## 3. CI/CD Pipeline Setup

### GitHub Actions Workflow

The CI/CD pipeline will:
1. ✅ Run tests and type checking
2. ✅ Build frontend and backend
3. ✅ Run security scans
4. ✅ Deploy to appropriate environment
5. ✅ Run smoke tests
6. ✅ Notify team on success/failure

### Workflow Triggers

| Branch | Environment | Trigger | Approval Required |
|--------|------------|---------|-------------------|
| `dev` | Development | Push | No |
| `staging` | Staging | Push | No |
| `main` | Production | PR Merge | Yes (2 approvals) |
| `hotfix/*` | Production | PR Merge | Yes (2 approvals) |

---

## 4. Deployment Platforms

### Backend: Render.com

#### Production Service Configuration
- **Service Type**: Web Service
- **Plan**: Starter ($7/mo) or Standard ($25/mo) for better performance
- **Region**: Choose closest to your users
- **Auto-Deploy**: Enabled (via CI/CD)
- **Health Check**: `/api/health`
- **Zero-Downtime**: Enabled (Render handles this automatically)

#### Environment Variables (Production)
```bash
NODE_ENV=production
NODE_VERSION=20.10.0
DATABASE_URL=<neon-production-url>
SESSION_SECRET=<strong-random-secret>
FRONTEND_URL=https://staffos.vercel.app
GOOGLE_CLIENT_ID=<production-oauth-id>
GOOGLE_CLIENT_SECRET=<production-oauth-secret>
RESEND_API_KEY=<production-resend-key>
```

### Frontend: Vercel

#### Production Configuration
- **Framework**: Vite
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `dist/public`
- **Production Branch**: `main`
- **Preview Branches**: `staging`, `dev`

#### Environment Variables (Production)
```bash
VITE_API_URL=https://staffos-backend.onrender.com
```

### Database: Neon PostgreSQL

#### Production Database
- **Project**: `staffos-production`
- **Region**: Same as backend
- **Plan**: Scale (for production workloads)
- **Backups**: Automatic (daily)
- **Connection Pooling**: Enabled

---

## 5. Daily Update Workflow

### Standard Daily Update Process

#### Step 1: Development (Morning)
```bash
# 1. Start from dev branch
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/daily-update-YYYY-MM-DD

# 3. Make your changes
# ... code changes ...

# 4. Commit and push
git add .
git commit -m "feat: daily update - description"
git push origin feature/daily-update-YYYY-MM-DD

# 5. Create PR: feature/* → dev
# 6. Review and merge PR
```

#### Step 2: Auto-Deploy to Development
- ✅ GitHub Actions automatically deploys to dev environment
- ✅ Smoke tests run automatically
- ✅ Team notified of deployment status

#### Step 3: Testing (Afternoon)
- ✅ Test features on dev environment
- ✅ Fix any issues found
- ✅ Repeat Step 1-2 if needed

#### Step 4: Promote to Staging (End of Day)
```bash
# 1. Ensure dev is stable
git checkout dev
git pull origin dev

# 2. Create PR: dev → staging
# 3. Review and merge
```

#### Step 5: Staging Validation (Next Morning)
- ✅ Full QA testing on staging
- ✅ Performance testing
- ✅ Security checks

#### Step 6: Deploy to Production (After Validation)
```bash
# 1. Create release PR: staging → main
# 2. Require 2 approvals
# 3. Merge PR (triggers production deployment)
# 4. Monitor deployment
```

### Quick Update Workflow (For Urgent Fixes)

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/urgent-fix-description

# 2. Make fix
git add .
git commit -m "fix: urgent fix description"
git push origin hotfix/urgent-fix-description

# 3. Create PR: hotfix/* → main
# 4. Get 2 approvals
# 5. Merge (deploys to production immediately)
# 6. Backport to dev and staging
git checkout dev
git cherry-pick <commit-hash>
git push origin dev
```

---

## 6. Zero-Downtime Deployment

### How It Works

#### Render (Backend)
- ✅ Render automatically performs zero-downtime deployments
- ✅ New instance starts before old one stops
- ✅ Health checks ensure new instance is ready
- ✅ Traffic switches seamlessly

#### Vercel (Frontend)
- ✅ Vercel uses atomic deployments
- ✅ New build is ready before switching
- ✅ Instant rollback capability
- ✅ Preview deployments don't affect production

### Deployment Process

1. **Pre-Deployment**
   - CI/CD runs tests
   - Build succeeds
   - Security scans pass

2. **Deployment**
   - New version builds
   - Health checks run
   - Traffic gradually shifts

3. **Post-Deployment**
   - Smoke tests verify functionality
   - Monitoring alerts if issues detected
   - Rollback available if needed

---

## 7. Database Migration Strategy

### Migration Workflow

#### Development Migrations
```bash
# 1. Create migration locally
npm run db:push

# 2. Test migration on dev database
DATABASE_URL=<dev-db-url> npm run db:push

# 3. Commit migration files
git add shared/schema.ts drizzle/
git commit -m "feat: database migration - description"
```

#### Production Migrations

**⚠️ CRITICAL: Always test migrations on staging first!**

```bash
# 1. Test on staging
DATABASE_URL=<staging-db-url> npm run db:push

# 2. Verify data integrity on staging
# 3. Create migration script if needed
# 4. Document rollback procedure

# 5. Apply to production (during low-traffic period)
DATABASE_URL=<production-db-url> npm run db:push

# 6. Monitor for issues
```

### Migration Best Practices

1. ✅ **Always backup before migration**
2. ✅ **Test on staging first**
3. ✅ **Run during low-traffic hours**
4. ✅ **Have rollback plan ready**
5. ✅ **Monitor database performance**
6. ✅ **Use transactions when possible**

---

## 8. Monitoring & Rollback

### Monitoring Setup

#### Application Monitoring
- **Render**: Built-in logs and metrics
- **Vercel**: Analytics and logs
- **Neon**: Database metrics and query logs

#### Recommended Tools
- **Sentry**: Error tracking
- **Uptime Robot**: Uptime monitoring
- **LogRocket**: User session replay (optional)

### Health Checks

#### Backend Health Endpoint
```typescript
// Already exists at /api/health
GET /api/health
Response: { "status": "ok", "timestamp": "..." }
```

#### Frontend Health Check
- Monitor page load times
- Check API connectivity
- Verify user authentication

### Rollback Procedure

#### Backend Rollback (Render)
1. Go to Render Dashboard → Service → Deploys
2. Find previous successful deployment
3. Click "Rollback to this deploy"
4. Confirm rollback

#### Frontend Rollback (Vercel)
1. Go to Vercel Dashboard → Project → Deployments
2. Find previous deployment
3. Click "..." → "Promote to Production"
4. Confirm promotion

#### Database Rollback
- If migration fails, restore from backup
- Neon provides automatic backups
- Contact Neon support if needed

---

## 9. Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong, unique secrets for each environment
- ✅ Rotate secrets regularly
- ✅ Use environment-specific OAuth credentials

### API Security
- ✅ CORS properly configured
- ✅ Rate limiting (consider adding)
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (using Drizzle ORM)

### Authentication
- ✅ Secure session management
- ✅ HTTPS only in production
- ✅ Strong password requirements
- ✅ OAuth properly configured

### Database Security
- ✅ SSL connections only (`?sslmode=require`)
- ✅ Connection pooling enabled
- ✅ Regular backups
- ✅ Access logging enabled

---

## 10. Quick Reference

### Daily Commands

```bash
# Start development
git checkout dev
git pull origin dev
npm run dev

# Create feature
git checkout -b feature/description
# ... make changes ...
git add .
git commit -m "feat: description"
git push origin feature/description

# Deploy to dev (automatic via CI/CD)
# Deploy to staging
git checkout staging
git merge dev
git push origin staging

# Deploy to production (via PR)
# Create PR: staging → main
```

### Environment URLs

| Environment | Frontend | Backend | Database |
|------------|----------|---------|----------|
| Development | `staffos-dev.vercel.app` | `staffos-backend-dev.onrender.com` | Neon DEV |
| Staging | `staffos-staging.vercel.app` | `staffos-backend-staging.onrender.com` | Neon STAGING |
| Production | `staffos.vercel.app` | `staffos-backend.onrender.com` | Neon PROD |

### Emergency Contacts

- **Render Support**: support@render.com
- **Vercel Support**: support@vercel.com
- **Neon Support**: support@neon.tech

---

## 🚀 Getting Started

### Initial Production Setup

1. **Create Production Databases**
   - Neon: Create `staffos-production` project
   - Save connection string securely

2. **Setup Render Production Service**
   - Create new web service
   - Connect to `main` branch
   - Configure environment variables
   - Enable auto-deploy

3. **Setup Vercel Production**
   - Create new project
   - Connect to `main` branch
   - Configure environment variables
   - Set production branch to `main`

4. **Setup CI/CD Pipeline**
   - Create `.github/workflows/deploy.yml` (see next section)
   - Configure branch protection rules
   - Test pipeline on dev branch

5. **Initial Database Migration**
   - Run migrations on production database
   - Verify schema is correct
   - Test connection

6. **Smoke Tests**
   - Test authentication
   - Test core features
   - Verify API connectivity

---

## 📝 Next Steps

1. ✅ Review and customize this strategy for your needs
2. ✅ Set up GitHub Actions workflow (see `.github/workflows/deploy.yml`)
3. ✅ Configure branch protection rules
4. ✅ Create staging environment
5. ✅ Set up monitoring tools
6. ✅ Document team-specific procedures
7. ✅ Train team on deployment workflow

---

## ⚠️ Important Notes

- **Never deploy directly to production** - Always use PR workflow
- **Always test on staging first** - Catch issues before production
- **Monitor after deployment** - Watch for errors and performance issues
- **Have rollback plan ready** - Know how to revert if needed
- **Communicate deployments** - Notify team of production changes
- **Backup before migrations** - Always have a safety net

---

**Last Updated**: 2024
**Maintained By**: Development Team

