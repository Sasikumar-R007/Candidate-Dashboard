# StaffOS Candidate Dashboard - Complete Setup Guide

## 📋 Project Overview

This is a **full-stack recruitment management system** built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js 20
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store

---

## 🔧 External Software Required

### 1. Node.js (REQUIRED)

- **Version**: 20.0.0 or higher
- **Download**: https://nodejs.org/
- **Installation**:
  - Windows: Download the LTS installer (.msi) and run it
  - Mac: Download from nodejs.org or use Homebrew: `brew install node`
  - Linux: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`
- **Verify**: Open terminal and run:
  ```bash
  node --version
  npm --version
  ```
  Should show Node.js v20+ and npm v10+

### 2. PostgreSQL Database (REQUIRED)

You have **TWO options**:

#### Option A: Install PostgreSQL Locally (Recommended for Development)

- **Version**: 14 or higher (16 recommended)
- **Windows Download**: https://www.postgresql.org/download/windows/
  - Use the PostgreSQL installer
  - Remember the password you set for the `postgres` user
  - Default port: 5432
- **Mac**:
  ```bash
  brew install postgresql@16
  brew services start postgresql@16
  ```
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  sudo systemctl start postgresql
  ```
- **Verify**:
  ```bash
  psql --version
  ```

#### Option B: Use Docker (Easier Alternative)

- **Install Docker Desktop**: https://www.docker.com/products/docker-desktop/
- The project includes `docker-compose.yml` for easy PostgreSQL setup
- No manual PostgreSQL installation needed

### 3. Git (Optional but Recommended)

- **Download**: https://git-scm.com/downloads
- Already installed if you cloned the repository

---

## 📦 Step-by-Step Setup Instructions

### Step 1: Verify Prerequisites

Open PowerShell (Windows) or Terminal (Mac/Linux) and check:

```powershell
# Check Node.js
node --version    # Should be v20.0.0 or higher
npm --version     # Should be v10.0.0 or higher

# Check PostgreSQL (if installed locally)
psql --version    # Should show PostgreSQL version
```

If any are missing, install them first using the links above.

---

### Step 2: Navigate to Project Directory

```powershell
# Navigate to your project folder
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
```

---

### Step 3: Install Project Dependencies

```powershell
npm install
```

**What this does:**

- Downloads and installs all 100+ packages listed in `package.json`
- Creates `node_modules/` folder (can be 500MB+)
- Takes 2-5 minutes depending on internet speed

**If you get errors:**

- Make sure Node.js is installed correctly
- Try: `npm cache clean --force` then `npm install` again

---

### Step 4: Set Up Database

#### If Using Local PostgreSQL:

1. **Start PostgreSQL Service** (if not running):

   - **Windows**: Check Services app → PostgreSQL service should be running
   - **Mac**: `brew services start postgresql@16`
   - **Linux**: `sudo systemctl start postgresql`

2. **Create Database**:

   ```powershell
   # Connect to PostgreSQL
   psql -U postgres

   # Inside psql, create database:
   CREATE DATABASE staffos_dev;

   # Exit psql
   \q
   ```

   **Note**: If you get "psql: command not found", add PostgreSQL to your PATH or use full path:

   - Windows: `C:\Program Files\PostgreSQL\16\bin\psql.exe -U postgres`
   - Mac: `/usr/local/bin/psql -U postgres`

#### If Using Docker:

```powershell
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps
```

This creates a PostgreSQL database with:

- Database name: `staffos_dev`
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

---

### Step 5: Create Environment Variables File

Create a file named `.env` in the project root directory (same folder as `package.json`).

**Windows PowerShell:**

```powershell
New-Item -Path .env -ItemType File
```

**Or manually create** a file named `.env` (no extension) in the project root.

**Add this content to `.env`:**

```env
# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/staffos_dev"

# Environment (REQUIRED)
NODE_ENV=development

# Session Secret (REQUIRED)
SESSION_SECRET=dev-secret-key-change-in-production-min-32-chars

# Frontend URL (for local development)
FRONTEND_URL=http://localhost:5000

# Optional: Google OAuth (skip if not using)
# GOOGLE_CLIENT_ID=your_google_client_id_here
# GOOGLE_CLIENT_SECRET=your_google_client_secret_here
# VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Optional: Email Service (skip if not using)
# RESEND_API_KEY=your_resend_api_key_here
# FROM_EMAIL=StaffOS <onboarding@resend.dev>

# Optional: For Replit deployment (not needed locally)
# REPLIT_DEV_DOMAIN=localhost
```

**Important Replacements:**

- Replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password
  - If using Docker: use `postgres`
  - If installed locally: use the password you set during installation
- Replace `SESSION_SECRET` with a random string (at least 32 characters)
  - Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Example `.env` file:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/staffos_dev"
NODE_ENV=development
SESSION_SECRET=7f3b9e2d1a4c6f8e5b2a9c4d7e1f3a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f
FRONTEND_URL=http://localhost:5000
```

---

### Step 6: Push Database Schema

This creates all the necessary tables in your database:

```powershell
npm run db:push
```

**Expected output:**

```
✓ Performing 'push' migration
✓ [1/1] Creating tables...
Migration completed successfully
```

**If you get errors:**

- Check that PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Test connection: `psql -U postgres -d staffos_dev -h localhost`

---

### Step 7: Run the Project

Start the development server:

```powershell
npm run dev
```

**What happens:**

- Backend Express server starts on `http://localhost:5000`
- Vite dev server starts (for frontend hot-reload)
- Both run simultaneously

**Expected output:**

```
> rest-express@1.0.0 dev
> cross-env NODE_ENV=development tsx server/index.ts

[express] 🚀 Backend server running on http://0.0.0.0:5000
[vite] Vite dev server active
```

---

### Step 8: Open in Browser

Open your web browser and navigate to:

```
http://localhost:5000
```

You should see the StaffOS application homepage.

---

## 🛠️ Available Commands

| Command           | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start development server (frontend + backend) |
| `npm run build`   | Build for production                          |
| `npm run start`   | Run production build                          |
| `npm run db:push` | Update database schema                        |
| `npm run check`   | Check TypeScript errors                       |

---

## 🐛 Troubleshooting

### Issue: "DATABASE_URL not found" or "Cannot connect to database"

**Solutions:**

1. Check `.env` file exists in project root
2. Verify PostgreSQL is running:
   - Windows: Services app → PostgreSQL
   - Mac: `brew services list`
   - Linux: `sudo systemctl status postgresql`
3. Test database connection:
   ```powershell
   psql -U postgres -d staffos_dev -h localhost
   ```
4. Verify `DATABASE_URL` format in `.env`:
   ```
   postgresql://username:password@localhost:5432/database_name
   ```

### Issue: "Port 5000 already in use"

**Windows:**

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**

```bash
lsof -ti:5000 | xargs kill -9
```

### Issue: "psql: command not found"

**Windows:**

- Add PostgreSQL to PATH:
  - Add `C:\Program Files\PostgreSQL\16\bin` to System Environment Variables
- Or use full path: `"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres`

**Mac/Linux:**

- PostgreSQL might not be in PATH
- Use: `sudo -u postgres psql` (Linux)
- Or: `/usr/local/bin/psql -U postgres` (Mac)

### Issue: "npm install fails" or "Module not found"

**Solutions:**

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: "NODE_ENV is not recognized" (Windows)

**Solution:** Already fixed! The project uses `cross-env` which works on all platforms. Just run:

```powershell
npm run dev
```

### Issue: Database connection works but `npm run db:push` fails

**Solutions:**

1. Check `DATABASE_URL` in `.env` has correct format
2. Ensure database `staffos_dev` exists
3. Verify user has CREATE TABLE permissions
4. Try: `psql -U postgres -d staffos_dev` and run `\dt` to see existing tables

---

## 📁 Project Structure

```
Candidate-Dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Main app
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database connection
│   └── storage.ts         # Database operations
├── shared/                 # Shared code
│   └── schema.ts          # Database schema (Drizzle ORM)
├── .env                   # Environment variables (CREATE THIS)
├── package.json           # Dependencies & scripts
├── drizzle.config.ts      # Database config
├── vite.config.ts         # Vite config
└── docker-compose.yml     # Docker PostgreSQL setup
```

---

## ✅ Verification Checklist

Before running the project, ensure:

- [ ] Node.js 20+ is installed (`node --version`)
- [ ] npm is installed (`npm --version`)
- [ ] PostgreSQL is installed and running (or Docker is running)
- [ ] Database `staffos_dev` exists
- [ ] `.env` file exists in project root
- [ ] `DATABASE_URL` in `.env` is correct
- [ ] `npm install` completed successfully
- [ ] `npm run db:push` completed successfully

---

## 🚀 Quick Start Summary

For experienced developers, here's the TL;DR:

```powershell
# 1. Install Node.js 20+ and PostgreSQL 14+
# 2. Navigate to project
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"

# 3. Install dependencies
npm install

# 4. Create database
psql -U postgres -c "CREATE DATABASE staffos_dev;"

# 5. Create .env file with:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/staffos_dev"
# NODE_ENV=development
# SESSION_SECRET=your-random-secret-32-chars-min

# 6. Push schema
npm run db:push

# 7. Run project
npm run dev

# 8. Open http://localhost:5000
```

---

## 📚 Additional Resources

- **Node.js Docs**: https://nodejs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Drizzle ORM**: https://orm.drizzle.team
- **React Docs**: https://react.dev
- **Express.js**: https://expressjs.com

---

## 🆘 Still Having Issues?

1. **Check error messages** in terminal - they usually tell you what's wrong
2. **Verify all prerequisites** are installed correctly
3. **Test database connection** manually with `psql`
4. **Check `.env` file** format and values
5. **Restart everything**: Close terminal, reopen, try again
6. **Check project documentation**: See `README.md` and `LOCAL_SETUP_GUIDE.md`

---

**Last Updated**: Based on project analysis  
**Project**: StaffOS Candidate Dashboard  
**Tech Stack**: React + Express + PostgreSQL + Drizzle ORM
