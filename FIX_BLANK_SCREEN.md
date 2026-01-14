# Fix Blank White Screen Issue

## 🔍 Problem
The localhost preview is showing a blank white screen.

## ✅ Solution Steps

### Step 1: Check Browser Console for Errors
1. Open your browser (Chrome/Edge)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for any red error messages
5. **Copy any errors you see** - this will help identify the issue

### Step 2: Clear Browser Cache
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

### Step 3: Restart Development Server
1. **Stop the server** (if running):
   - Press `Ctrl + C` in the terminal where `npm run dev` is running

2. **Clear node_modules cache** (optional but recommended):
   ```powershell
   cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
   Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
   ```

3. **Restart the server**:
   ```powershell
   npm run dev
   ```

4. **Wait for both servers to start:**
   - You should see: `🚀 Backend server running on http://localhost:5000`
   - And: `Vite dev server active`

### Step 4: Hard Refresh Browser
1. Go to `http://localhost:5000`
2. Press `Ctrl + Shift + R` (or `Ctrl + F5`)
3. This forces a hard refresh bypassing cache

### Step 5: Check Network Tab
1. Press `F12` → **Network** tab
2. Refresh the page (`F5`)
3. Look for any failed requests (red entries)
4. Check if `index.html` loads successfully

### Step 6: Check for JavaScript Errors
If you see errors in console, common issues:

**Error: "Cannot read property of undefined"**
- This might be from the resume parsing code
- The fix I applied should resolve this

**Error: "Module not found"**
- Try: `npm install` to reinstall dependencies

**Error: "Port already in use"**
- Kill the process using port 5000:
  ```powershell
  netstat -ano | findstr :5000
  taskkill /PID <PID_NUMBER> /F
  ```

---

## 🐛 If Still Blank After These Steps

1. **Check if backend is running:**
   - Visit: `http://localhost:5000/api/health` (if you have this endpoint)
   - Or check terminal for server logs

2. **Try incognito/private window:**
   - Open a new incognito window
   - Navigate to `http://localhost:5000`
   - This eliminates cache/cookie issues

3. **Check the HTML is loading:**
   - Right-click on blank page → "View Page Source"
   - You should see HTML content
   - If you see nothing, the server isn't serving files

4. **Verify Vite is working:**
   - Check terminal for Vite errors
   - Look for: `[vite]` messages in console

---

## 📝 Quick Checklist

- [ ] Browser console checked for errors
- [ ] Browser cache cleared
- [ ] Development server restarted
- [ ] Hard refresh done (`Ctrl + Shift + R`)
- [ ] Network tab checked for failed requests
- [ ] Tried incognito window
- [ ] Checked terminal for server errors

---

## 💡 Most Common Causes

1. **JavaScript error** - Check console (F12)
2. **Server not running** - Check terminal
3. **Port conflict** - Another app using port 5000
4. **Cache issue** - Clear browser cache
5. **Build error** - Check terminal for compilation errors

