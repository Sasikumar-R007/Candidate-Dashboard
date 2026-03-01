# How to Disable Auto-Deploy in Render

## Step-by-Step Guide

### Step 1: Access Your Backend Service
1. Go to https://dashboard.render.com
2. Log in to your account
3. Click on your backend service (`staffos-backend`)

### Step 2: Go to Settings
1. Click on **"Settings"** tab (left sidebar)
2. Scroll down to **"Build & Deploy"** section

### Step 3: Disable Auto-Deploy
1. Find **"Auto-Deploy"** setting
2. You'll see options:
   - **"Yes"** - Auto-deploy on git push (currently enabled)
   - **"No"** - Manual deploy only (what you want)

3. **Select "No"** or toggle it off
4. Click **"Save Changes"** button

### Step 4: Verify
- Auto-deploy should now be disabled
- You'll need to manually trigger deployments
- No automatic deployments on git push to main branch

---

## Alternative: Manual Deploy Only

### Option 1: Disable Auto-Deploy (Recommended)
- Go to Settings → Auto-Deploy → Set to "No"
- Deploy manually when needed via Render dashboard

### Option 2: Change Branch
- Keep auto-deploy but change branch from `main` to `staging` or `dev`
- Only staging/dev will auto-deploy
- Main requires manual deploy

### Option 3: Use Manual Deploy Button
- Even with auto-deploy enabled, you can use "Manual Deploy" button
- But disabling is cleaner for office/production use

---

## How to Manually Deploy (After Disabling Auto-Deploy)

1. Go to Render Dashboard → Your Backend
2. Click **"Manual Deploy"** button (top right)
3. Select:
   - **"Deploy latest commit"** - Deploy current code
   - **"Deploy specific commit"** - Choose a commit
4. Click **"Deploy"**
5. Wait for deployment to complete

---

## Benefits of Disabling Auto-Deploy for Main

✅ **Control:** Deploy only when ready  
✅ **Stability:** No unexpected deployments  
✅ **Testing:** Test on staging/dev first  
✅ **Office Use:** Production stays stable  
✅ **Safety:** Review changes before deploying  

---

## Recommended Setup

### For Production (Main Branch):
- ✅ Auto-Deploy: **Disabled**
- ✅ Manual deploy only
- ✅ Test on staging first

### For Staging/Dev Branches:
- ✅ Auto-Deploy: **Enabled**
- ✅ Automatic testing
- ✅ Quick iteration

---

## Quick Reference

**To Disable:**
1. Render Dashboard → Backend → Settings
2. Auto-Deploy → Set to "No"
3. Save Changes

**To Deploy Manually:**
1. Render Dashboard → Backend
2. Click "Manual Deploy"
3. Select commit
4. Deploy

---

**Status:** Ready to Configure

