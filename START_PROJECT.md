# How to Run the Project - Step by Step Guide

## Quick Start (Normal Case)

1. **Navigate to project directory:**
   ```powershell
   cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
   ```

2. **Start the development server:**
   ```powershell
   npm run dev
   ```

3. **Wait for the server to start** - You should see:
   - `🚀 Backend server running on http://localhost:5000`
   - `Vite dev server active`

4. **Open your browser and go to:**
   ```
   http://localhost:5000
   ```

---

## If Port 5000 is Already in Use

If you see this error:
```
Error: listen EADDRINUSE: address already in use ::1:5000
```

**Follow these steps:**

### Step 1: Find the process using port 5000
```powershell
netstat -ano | findstr :5000
```

This will show output like:
```
TCP    [::1]:5000             [::]:0                 LISTENING       9068
```
The last number (e.g., `9068`) is the Process ID (PID).

### Step 2: Kill the process
Replace `9068` with the PID number from Step 1:
```powershell
taskkill /PID 9068 /F
```

You should see:
```
SUCCESS: The process with PID 9068 has been terminated.
```

### Step 3: Start the server again
```powershell
npm run dev
```

---

## What to Expect When Running Successfully

✅ **Terminal Output:**
- `Google OAuth not configured...` (this is OK if you're not using Google OAuth)
- `🚀 Backend server running on http://localhost:5000`
- `Vite dev server active`

✅ **Browser:**
- The application should load properly (not a blank white screen)
- No console errors about module loading

---

## Important Notes

1. **Always stop the server properly:**
   - Press `Ctrl + C` in the terminal to stop the server
   - Wait for it to fully stop before starting again

2. **If the browser shows a blank screen:**
   - Make sure the server is actually running (check terminal)
   - Hard refresh the browser: `Ctrl + Shift + R` or `Ctrl + F5`
   - Check browser console for errors

3. **Multiple terminal windows:**
   - Make sure you're not running `npm run dev` in multiple terminals
   - Only ONE instance should be running at a time

---

## Troubleshooting

### Issue: Server won't start
- **Solution:** Check if port 5000 is in use (see "If Port 5000 is Already in Use" above)

### Issue: Blank white screen
- **Solution 1:** Make sure the server is running (check terminal)
- **Solution 2:** Hard refresh browser (`Ctrl + Shift + R`)
- **Solution 3:** Check browser console for errors

### Issue: Changes not reflecting
- **Solution:** Vite should auto-reload. If not, try:
  - Save the file again
  - Hard refresh browser
  - Restart the dev server

