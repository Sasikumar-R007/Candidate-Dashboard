# Debug Blank White Screen - Step by Step

## 🔍 Immediate Checks (Do These First!)

### 1. Check Browser Console (CRITICAL!)
1. Open your browser to `http://localhost:5000`
2. Press `F12` to open Developer Tools
3. Click on **Console** tab
4. Look for **RED error messages**
5. **Copy and paste any errors you see**

Common errors you might see:
- `Uncaught ReferenceError: ...`
- `Failed to load module: ...`
- `SyntaxError: ...`
- `TypeError: Cannot read property...`

### 2. Check Terminal Output
Look at the terminal where you ran `npm run dev`:
- Do you see: `🚀 Backend server running on http://localhost:5000`?
- Do you see: `Vite dev server active`?
- Are there any **error messages** in red?

### 3. Check Network Tab
1. Press `F12` → **Network** tab
2. Refresh the page (`F5`)
3. Look for:
   - **Red/failed requests** (these indicate problems)
   - Is `index.html` loading? (status 200)
   - Are JavaScript files loading? (`main.tsx`, etc.)

### 4. Check if Server is Running
Open a new browser tab and visit:
```
http://localhost:5000/api/health
```
- If you see JSON response → Backend is running
- If connection refused → Backend is NOT running

---

## 🛠️ Quick Fixes to Try

### Fix 1: Restart Dev Server
```powershell
# Stop the server (Ctrl+C in the terminal)
# Then:
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
npm run dev
```

### Fix 2: Clear Vite Cache
```powershell
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
npm run dev
```

### Fix 3: Hard Refresh Browser
- Press `Ctrl + Shift + R` (or `Ctrl + F5`)
- Or clear cache: `Ctrl + Shift + Delete` → Clear cached files

### Fix 4: Try Incognito Window
- Open a new Incognito/Private window
- Navigate to `http://localhost:5000`
- This eliminates cache/cookie issues

---

## 📋 Information Needed from You

Please provide:
1. **Browser console errors** (F12 → Console tab)
2. **Terminal output** (what you see when running `npm run dev`)
3. **Network tab errors** (F12 → Network tab → refresh → any red entries)
4. **What you see** when visiting `http://localhost:5000/api/health`

---

## 🚨 Most Likely Causes

Based on the code we just modified:

1. **JavaScript Syntax Error** - Check console (F12)
2. **Module Import Error** - Check console for "Cannot find module"
3. **Server Not Running** - Check terminal
4. **Port Conflict** - Another app using port 5000
5. **Build Compilation Error** - Check terminal output

