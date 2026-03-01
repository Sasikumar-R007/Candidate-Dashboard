# Daily Update Workflow Guide
## Step-by-Step Process for Daily Production Updates

This guide provides a clear, step-by-step process for making daily updates to StaffOS without causing conflicts or downtime.

---

## 📅 Daily Update Schedule

### Recommended Timeline

- **Morning (9:00 AM - 12:00 PM)**: Development & Testing
- **Afternoon (12:00 PM - 4:00 PM)**: Staging Deployment & QA
- **Evening (4:00 PM - 6:00 PM)**: Production Deployment (if validated)

---

## 🔄 Standard Daily Update Process

### Phase 1: Development (Morning)

#### Step 1: Start Your Day
```bash
# Navigate to project directory
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"

# Switch to dev branch and get latest changes
git checkout dev
git pull origin dev

# Verify you're up to date
git status
```

#### Step 2: Create Feature Branch
```bash
# Create a descriptive branch name with date
git checkout -b feature/daily-update-2024-01-15

# Or for specific features:
git checkout -b feature/add-new-feature-name
```

#### Step 3: Make Your Changes
- Make code changes
- Test locally if possible
- Commit frequently with clear messages

```bash
# After making changes
git add .
git commit -m "feat: add new feature description"
git push origin feature/daily-update-2024-01-15
```

#### Step 4: Create Pull Request
1. Go to GitHub repository
2. Click "New Pull Request"
3. Select: `feature/daily-update-2024-01-15` → `dev`
4. Add description of changes
5. Request review (if team review is needed)
6. Merge PR after approval

#### Step 5: Auto-Deploy to Development
- ✅ GitHub Actions automatically deploys to dev
- ✅ Check deployment status in GitHub Actions tab
- ✅ Verify deployment at: `https://staffos-backend-dev.onrender.com`

---

### Phase 2: Testing (Afternoon)

#### Step 6: Test on Development Environment
1. Visit: `https://staffos-dev.vercel.app`
2. Test all changed features
3. Check browser console for errors
4. Verify API connectivity
5. Test user flows

#### Step 7: Fix Any Issues
If issues found:
```bash
# Create fix branch
git checkout dev
git pull origin dev
git checkout -b bugfix/fix-issue-description

# Make fixes
git add .
git commit -m "fix: issue description"
git push origin bugfix/fix-issue-description

# Create PR and merge
```

---

### Phase 3: Staging Deployment (Afternoon)

#### Step 8: Promote to Staging
```bash
# Ensure dev is stable
git checkout dev
git pull origin dev

# Create staging PR
# Go to GitHub → New Pull Request
# Select: dev → staging
# Add description: "Daily update - [date]"
# Review changes
# Merge PR
```

#### Step 9: Staging Validation
1. Wait for staging deployment (2-5 minutes)
2. Visit: `https://staffos-staging.vercel.app`
3. Perform full QA testing:
   - ✅ All features work correctly
   - ✅ No console errors
   - ✅ Performance is acceptable
   - ✅ Database operations work
   - ✅ Authentication works
   - ✅ File uploads work (if applicable)

---

### Phase 4: Production Deployment (Evening)

#### Step 10: Deploy to Production
**⚠️ Only proceed if staging validation passed!**

```bash
# Create production release PR
# Go to GitHub → New Pull Request
# Select: staging → main
# Add description: "Production release - [date]"
# List all changes in description
# Request 2 approvals (required)
# Wait for approvals
# Merge PR
```

#### Step 11: Monitor Production Deployment
1. Watch GitHub Actions for deployment status
2. Check Render dashboard for backend deployment
3. Check Vercel dashboard for frontend deployment
4. Monitor logs for errors

#### Step 12: Production Smoke Tests
After deployment completes (5-10 minutes):
1. Visit production URL
2. Test critical user flows:
   - ✅ Login works
   - ✅ Core features accessible
   - ✅ No console errors
   - ✅ API responses correct
3. Monitor for 15-30 minutes

---

## 🚨 Quick Update Workflow (For Urgent Fixes)

### When to Use
- Critical bug in production
- Security vulnerability
- Data corruption issue
- Service outage

### Process

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix-description

# 2. Make the fix
# ... code changes ...
git add .
git commit -m "fix: critical fix description"
git push origin hotfix/critical-fix-description

# 3. Create PR: hotfix/* → main
# 4. Get 2 approvals (expedited)
# 5. Merge PR (deploys immediately)

# 6. Backport to dev and staging
git checkout dev
git pull origin dev
git cherry-pick <commit-hash>
git push origin dev

git checkout staging
git pull origin staging
git cherry-pick <commit-hash>
git push origin staging
```

---

## 📋 Daily Update Checklist

### Before Starting
- [ ] Check current production status
- [ ] Review yesterday's changes
- [ ] Check for any pending PRs
- [ ] Verify dev environment is accessible

### During Development
- [ ] Code changes committed
- [ ] PR created and reviewed
- [ ] Merged to dev branch
- [ ] Dev deployment successful

### Before Staging
- [ ] All features tested on dev
- [ ] No critical bugs found
- [ ] Code review completed
- [ ] Documentation updated (if needed)

### Before Production
- [ ] Staging validation passed
- [ ] All tests green
- [ ] 2 approvals received
- [ ] Deployment plan reviewed
- [ ] Rollback plan ready

### After Production
- [ ] Deployment successful
- [ ] Smoke tests passed
- [ ] Monitoring shows no errors
- [ ] Team notified
- [ ] Documentation updated

---

## 🔍 Verification Steps

### Check Deployment Status

#### Backend (Render)
```bash
# Check health endpoint
curl https://staffos-backend-dev.onrender.com/api/health
curl https://staffos-backend-staging.onrender.com/api/health
curl https://staffos-backend.onrender.com/api/health
```

#### Frontend (Vercel)
- Visit the URL in browser
- Check browser console (F12)
- Verify API calls are working
- Test user authentication

#### Database (Neon)
- Check Neon dashboard
- Verify connection status
- Review query logs (if needed)
- Check for any errors

---

## 🛠️ Troubleshooting Common Issues

### Issue: Deployment Failed

**Solution:**
1. Check GitHub Actions logs
2. Review error messages
3. Fix issues in code
4. Create new PR with fixes
5. Re-deploy

### Issue: Build Errors

**Solution:**
```bash
# Test build locally
npm run build

# Fix any TypeScript errors
npm run check

# Fix any build issues
# Commit and push fixes
```

### Issue: Database Connection Errors

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check Neon project is active
3. Verify SSL mode is set (`?sslmode=require`)
4. Check connection pool settings

### Issue: Frontend Not Connecting to Backend

**Solution:**
1. Verify `VITE_API_URL` is set correctly
2. Check CORS settings in backend
3. Verify backend is running
4. Check browser console for errors

---

## 📊 Daily Update Template

### PR Description Template

```markdown
## Daily Update - [Date]

### Changes Made
- [ ] Feature 1: Description
- [ ] Feature 2: Description
- [ ] Bug Fix: Description

### Testing Performed
- [ ] Tested locally
- [ ] Tested on dev environment
- [ ] All features working

### Database Changes
- [ ] No database changes
- [ ] Migration required: [description]
- [ ] Migration tested on dev

### Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes: [description]

### Rollback Plan
- [ ] No rollback needed
- [ ] Rollback steps: [description]
```

---

## ⚡ Quick Commands Reference

```bash
# Start development
git checkout dev && git pull origin dev
npm run dev

# Create feature
git checkout -b feature/name
# ... make changes ...
git add . && git commit -m "feat: description" && git push origin feature/name

# Check deployment status
curl https://staffos-backend-dev.onrender.com/api/health

# View recent commits
git log --oneline -10

# Check current branch
git branch

# See what changed
git diff

# Stash changes (if needed)
git stash
git stash pop
```

---

## 🎯 Best Practices

1. **Commit Often**: Small, frequent commits are better than large ones
2. **Clear Messages**: Write descriptive commit messages
3. **Test Locally**: Test changes before pushing
4. **Review Code**: Always review PRs before merging
5. **Monitor Deployments**: Watch deployment status and logs
6. **Document Changes**: Update documentation when needed
7. **Communicate**: Notify team of significant changes
8. **Backup Before Migrations**: Always backup before database changes

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review deployment logs
3. Check GitHub Issues
4. Contact team lead
5. Check platform status pages:
   - Render: https://status.render.com
   - Vercel: https://www.vercel-status.com
   - Neon: https://status.neon.tech

---

**Remember**: The goal is smooth, conflict-free daily updates. When in doubt, test more, deploy carefully, and always have a rollback plan!

