# Quick Deployment Reference Card
## Essential Commands & URLs for Daily Operations

---

## 🚀 Quick Commands

### Daily Development
```bash
# Start working
git checkout dev && git pull origin dev
npm run dev

# Create feature
git checkout -b feature/description
# ... make changes ...
git add . && git commit -m "feat: description" && git push origin feature/description
```

### Deploy to Dev (Automatic)
```bash
# Just merge PR to dev branch
# GitHub Actions handles deployment automatically
```

### Deploy to Staging
```bash
git checkout staging
git merge dev
git push origin staging
# Auto-deploys via GitHub Actions
```

### Deploy to Production
```bash
# Create PR: staging → main
# Get 2 approvals
# Merge PR
# Auto-deploys via GitHub Actions
```

---

## 🌐 Environment URLs

### Development
- **Frontend**: `https://staffos-dev.vercel.app`
- **Backend**: `https://staffos-backend-dev.onrender.com`
- **Health Check**: `curl https://staffos-backend-dev.onrender.com/api/health`

### Staging
- **Frontend**: `https://staffos-staging.vercel.app`
- **Backend**: `https://staffos-backend-staging.onrender.com`
- **Health Check**: `curl https://staffos-backend-staging.onrender.com/api/health`

### Production
- **Frontend**: `https://staffos.vercel.app` (or custom domain)
- **Backend**: `https://staffos-backend.onrender.com` (or custom domain)
- **Health Check**: `curl https://staffos-backend.onrender.com/api/health`

---

## 🔍 Quick Verification

### Check Deployment Status
```bash
# Backend health
curl https://staffos-backend-dev.onrender.com/api/health
curl https://staffos-backend-staging.onrender.com/api/health
curl https://staffos-backend.onrender.com/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Check GitHub Actions
- Go to: `https://github.com/YOUR-ORG/YOUR-REPO/actions`
- Check latest workflow run status

### Check Render Dashboard
- Go to: `https://dashboard.render.com`
- Check service status and logs

### Check Vercel Dashboard
- Go to: `https://vercel.com/dashboard`
- Check deployment status

---

## 🛠️ Common Tasks

### Rollback Backend (Render)
1. Go to Render Dashboard → Service → Deploys
2. Find previous successful deployment
3. Click "Rollback to this deploy"

### Rollback Frontend (Vercel)
1. Go to Vercel Dashboard → Project → Deployments
2. Find previous deployment
3. Click "..." → "Promote to Production"

### Run Database Migration
```bash
# Development
DATABASE_URL="<dev-url>" npm run db:push

# Staging
DATABASE_URL="<staging-url>" npm run db:push

# Production (⚠️ Be careful!)
DATABASE_URL="<production-url>" npm run db:push
```

### View Logs
```bash
# Render logs: Dashboard → Service → Logs
# Vercel logs: Dashboard → Project → Deployments → View Logs
# GitHub Actions: Repository → Actions → Workflow Run → View Logs
```

---

## 📋 Branch Strategy

```
main (production)
  ↑
staging (pre-production)
  ↑
dev (development)
  ↑
feature/* (your work)
```

### Branch Rules
- **main**: Requires 2 approvals, auto-deploys to production
- **staging**: Requires 1 approval, auto-deploys to staging
- **dev**: Auto-deploys to development
- **feature/***: Create PR to dev

---

## ⚡ Emergency Procedures

### Production Issue Detected
1. **Immediate**: Rollback deployment (see above)
2. **Investigate**: Check logs and error reports
3. **Fix**: Create hotfix branch from main
4. **Deploy**: Follow hotfix workflow
5. **Backport**: Apply fix to dev and staging

### Database Issue
1. **Stop**: Pause any ongoing migrations
2. **Assess**: Check Neon dashboard for errors
3. **Restore**: Use Neon backup if needed
4. **Contact**: Reach out to Neon support if critical

### Service Down
1. **Check**: Render/Vercel status pages
2. **Verify**: Health checks on all environments
3. **Restart**: Manually restart service if needed
4. **Monitor**: Watch logs for recurring issues

---

## 📞 Quick Contacts

- **Render Status**: https://status.render.com
- **Vercel Status**: https://www.vercel-status.com
- **Neon Status**: https://status.neon.tech
- **GitHub Status**: https://www.githubstatus.com

---

## 🎯 Daily Workflow Summary

1. **Morning**: Work on `dev` branch → Create PR → Merge → Auto-deploy
2. **Afternoon**: Test on dev → Promote to staging → Test staging
3. **Evening**: If validated → Promote to production → Monitor

---

## ⚠️ Important Reminders

- ✅ Never deploy directly to production
- ✅ Always test on staging first
- ✅ Get approvals before production
- ✅ Monitor after deployment
- ✅ Have rollback plan ready
- ✅ Backup before migrations

---

**Print this page and keep it handy!**

