# 🔧 Fix: DATABASE_URL Error

## ✅ What I Fixed

I've added `dotenv` package to load your `.env` file automatically.

## 📦 Step 1: Install the New Package

Run this command:

```powershell
npm install
```

This will install the `dotenv` package I just added.

---

## ✅ Step 2: Verify Your .env File

Make sure your `.env` file in the **root directory** has this content:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/staffos_dev"
NODE_ENV=development
SESSION_SECRET=dev-secret-key-change-in-production-min-32-characters-long
FRONTEND_URL=http://localhost:5000
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual PostgreSQL password
- Make sure there are **quotes** around the DATABASE_URL value
- File must be named exactly `.env` (not `.env.txt`)

---

## ▶️ Step 3: Run the Project

```powershell
npm run dev
```

It should work now! 🎉

---

## 🔍 If Still Not Working

### Check 1: Verify .env File Location
Make sure `.env` is in the **root directory** (same folder as `package.json`):

```
Candidate-Dashboard/
├── .env          ← Should be here
├── package.json
├── client/
└── server/
```

### Check 2: Verify .env File Content
Open `.env` in a text editor and verify:
- No extra spaces
- Quotes around DATABASE_URL
- Correct password

### Check 3: Test Database Connection
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d staffos_dev
```

If this works, your database is fine. The issue is just the .env loading.

---

## ✅ Summary

1. Run: `npm install` (to install dotenv)
2. Verify: `.env` file exists in root with correct content
3. Run: `npm run dev`

That's it!

