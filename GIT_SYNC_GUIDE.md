# Git Sync Guide - Fixing Connection Issues

## 🔍 Problem: "Connection was reset" Error

This error occurs when:
- Network connectivity issues with GitHub
- Firewall/proxy blocking the connection
- GitHub rate limiting
- Large file uploads timing out

---

## ✅ Solution 1: Retry with Different Method

### Option A: Use SSH Instead of HTTPS (Recommended)

1. **Check your current remote URL:**
   ```powershell
   cd Candidate-Dashboard
   git remote -v
   ```

2. **If it shows HTTPS, switch to SSH:**
   ```powershell
   git remote set-url origin git@github.com:Sasikumar-R007/Candidate-Dashboard.git
   ```

3. **Test the connection:**
   ```powershell
   git fetch origin
   ```

4. **If SSH is not set up, use HTTPS with token (see Option B)**

### Option B: Use Personal Access Token (HTTPS)

1. **Generate a Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control)
   - Copy the token

2. **Update your remote URL with token:**
   ```powershell
   git remote set-url origin https://YOUR_TOKEN@github.com/Sasikumar-R007/Candidate-Dashboard.git
   ```

   Or use your username:
   ```powershell
   git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/Sasikumar-R007/Candidate-Dashboard.git
   ```

---

## ✅ Solution 2: Increase Git Buffer Size

Large files can cause timeouts. Increase the buffer:

```powershell
cd Candidate-Dashboard
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M
```

---

## ✅ Solution 3: Push in Smaller Batches

If you have many files, commit and push in smaller batches:

```powershell
# Stage and commit specific files
git add client/src/pages/admin-dashboard.tsx
git commit -m "Fix User Management layout"

git add client/src/pages/candidate-login.tsx
git commit -m "Remove Google login option"

git add client/src/components/dashboard/modals/UploadResumeModal.tsx
git commit -m "Add resume parsing functionality"

# Push each commit separately
git push origin main
```

---

## ✅ Solution 4: Check Network/Firewall

1. **Test GitHub connectivity:**
   ```powershell
   ping github.com
   ```

2. **If using VPN/Proxy:**
   - Try disabling temporarily
   - Or configure git to use proxy:
     ```powershell
     git config --global http.proxy http://proxy.example.com:8080
     ```

---

## ✅ Solution 5: Use Git Credential Manager

Windows Credential Manager might have stale credentials:

1. **Clear stored credentials:**
   - Open Windows Credential Manager
   - Go to Windows Credentials
   - Find `git:https://github.com`
   - Remove it

2. **Re-authenticate:**
   ```powershell
   git push origin main
   # Enter your GitHub username and Personal Access Token when prompted
   ```

---

## 🚀 Recommended Steps (Try in Order)

1. **First, check your current status:**
   ```powershell
   cd Candidate-Dashboard
   git status
   git remote -v
   ```

2. **Try pushing with verbose output to see the exact error:**
   ```powershell
   git push -v origin main
   ```

3. **If that fails, try increasing buffer:**
   ```powershell
   git config http.postBuffer 524288000
   git push origin main
   ```

4. **If still failing, switch to SSH or use Personal Access Token (see Solution 1)**

5. **As last resort, try pushing to a different branch first:**
   ```powershell
   git checkout -b backup-branch
   git push origin backup-branch
   # If this works, merge to main later
   ```

---

## 📝 Quick Commands Reference

```powershell
# Check status
git status

# Check remote URL
git remote -v

# Change remote to SSH
git remote set-url origin git@github.com:Sasikumar-R007/Candidate-Dashboard.git

# Change remote to HTTPS with token
git remote set-url origin https://YOUR_TOKEN@github.com/Sasikumar-R007/Candidate-Dashboard.git

# Increase buffer
git config http.postBuffer 524288000

# Push with verbose output
git push -v origin main

# Force push (USE WITH CAUTION - only if you're sure)
git push --force origin main
```

---

## ⚠️ Important Notes

- **Never force push to main** unless you're absolutely sure
- **Always backup** before force push: `git branch backup-branch`
- **Personal Access Tokens** are more secure than passwords
- **SSH keys** are the most secure method for authentication

---

## 🆘 Still Having Issues?

If none of the above work:

1. Check GitHub status: https://www.githubstatus.com/
2. Try from a different network (mobile hotspot)
3. Contact GitHub support if the issue persists

