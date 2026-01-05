# 🔄 Restart Instructions for Auth Fixes

## ⚠️ IMPORTANT: You MUST restart and clear browser data for fixes to work!

The authentication context changes require a full restart because:

1. React context providers cache state
2. Browser sessionStorage may have old data
3. Session cookies need to be re-established

---

## 📋 Step-by-Step Restart Process

### Step 1: Stop the Development Server

In your terminal where `npm run dev` is running:

1. Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac)
2. Wait for the server to fully stop
3. You should see the terminal prompt return

### Step 2: Clear Browser Storage (CRITICAL!)

**Option A: Clear All Site Data (Recommended)**

1. Open your browser (Chrome/Edge/Firefox)
2. Press `F12` to open Developer Tools
3. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
4. In the left sidebar, find **Storage** → **Cookies** → `http://localhost:5000`
5. Right-click and select **Clear** or click the trash icon
6. Also clear **sessionStorage** and **localStorage**:
   - Click on **sessionStorage** → `http://localhost:5000` → Right-click → **Clear**
   - Click on **localStorage** → `http://localhost:5000` → Right-click → **Clear**

**Option B: Hard Refresh (Quick Method)**

1. Press `Ctrl + Shift + Delete` (Windows/Linux) or `Cmd + Shift + Delete` (Mac)
2. Select "Cookies and other site data" and "Cached images and files"
3. Time range: "Last hour" or "All time"
4. Click "Clear data"

**Option C: Use Incognito/Private Window (Easiest)**

1. Open a new Incognito/Private window
2. Navigate to `http://localhost:5000`
3. This ensures no cached data interferes

### Step 3: Restart Development Server

In your project terminal:

```powershell
npm run dev
```

Wait for:

```
[express] 🚀 Backend server running on http://0.0.0.0:5000
[vite] Vite dev server active
```

### Step 4: Test the Fixes

1. **Open browser** to `http://localhost:5000`
2. **Log in** with any user account
3. **Test Refresh:**
   - Navigate to a protected page (e.g., `/source-resume`)
   - Press `F5` or `Ctrl + R` to refresh
   - ✅ **Expected:** You should remain logged in (no redirect to login)
4. **Test New Tab:**
   - While logged in, right-click a link to `/source-resume`
   - Select "Open in new tab"
   - ✅ **Expected:** Should show "Verifying session..." then load the page
5. **Test Security:**
   - Open an incognito window
   - Navigate directly to `/source-resume`
   - ✅ **Expected:** Should redirect to login page

---

## 🐛 If Issues Persist After Restart

### Check 1: Verify Code Changes Were Saved

Make sure `client/src/contexts/auth-context.tsx` has the updated code:

```typescript
// Should have this in initializeAuth function:
const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
if (stored) {
  const parsedUser = JSON.parse(stored) as AuthUser;
  setUser(parsedUser);
}
await verifySession();
```

### Check 2: Check Browser Console for Errors

1. Press `F12` → Go to **Console** tab
2. Look for any red error messages
3. Common issues:
   - CORS errors → Check `VITE_API_URL` in `.env`
   - Network errors → Check backend is running
   - Session errors → Check `SESSION_SECRET` is set

### Check 3: Verify Backend Session Configuration

Check `server/index.ts` has:

```typescript
cookie: {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}
```

### Check 4: Test Session Cookie

1. Open Developer Tools → **Application** → **Cookies** → `http://localhost:5000`
2. After logging in, you should see a cookie named `connect.sid`
3. If it's missing, session isn't being set properly

### Check 5: Network Tab Verification

1. Press `F12` → Go to **Network** tab
2. Log in
3. Look for request to `/api/auth/verify-session`
4. Check:
   - ✅ Status should be `200 OK`
   - ✅ Response should have `{"authenticated": true, ...}`
   - ✅ Request should include `Cookie: connect.sid=...` in headers

---

## 🔍 Debugging Commands

### Check if Server is Running

```powershell
# Windows
netstat -ano | findstr :5000

# Should show a process using port 5000
```

### Check Environment Variables

```powershell
# Verify .env file exists and has correct values
cat .env
# or
type .env
```

### Clear Node Cache (if needed)

```powershell
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall (last resort)
rm -rf node_modules
npm install
```

---

## ✅ Success Indicators

After restart, you should see:

1. **On Login:**

   - Session cookie `connect.sid` appears in browser
   - User data stored in sessionStorage
   - No console errors

2. **On Refresh:**

   - Page loads immediately (no flash of login page)
   - User remains logged in
   - sessionStorage persists

3. **On New Tab:**

   - Shows "Verifying session..." briefly
   - Then loads page content (if logged in)
   - Or redirects to login (if not logged in)

4. **Multi-User:**
   - Different users in different tabs work independently
   - No cross-user data leakage

---

## 📞 Still Having Issues?

If problems persist after following all steps:

1. **Check the exact error message** in browser console
2. **Verify all files were saved** (check file timestamps)
3. **Try a different browser** (to rule out browser-specific issues)
4. **Check backend logs** in terminal for errors
5. **Verify database connection** is working

---

**Last Updated:** $(date)
**Status:** Ready for Testing
