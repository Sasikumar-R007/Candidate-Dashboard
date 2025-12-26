# 🚀 Quick Start Instructions - StaffOS Project

## ✅ Prerequisites (You Already Have These!)
- ✅ Node.js installed
- ✅ PostgreSQL 18 installed

---

## 📍 STEP 1: Navigate to Project Root

Open PowerShell and go to your project folder:

```powershell
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
```

---

## 📦 STEP 2: Install Dependencies

```powershell
npm install
```

**Wait for this to complete** (takes 2-5 minutes). You'll see `node_modules/` folder created.

---

## 🗄️ STEP 3: Setup PostgreSQL Database

### 3.1: Start PostgreSQL Service

**Windows:**
- Press `Win + R`, type `services.msc`, press Enter
- Find "PostgreSQL" service
- Right-click → Start (if not running)

**OR use PowerShell:**
```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*
```

### 3.2: Create Database

Open PowerShell and run:

```powershell
# Connect to PostgreSQL (you'll be asked for password)
psql -U postgres
```

**If `psql` command not found**, use full path:
```powershell
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

**Inside psql, run:**
```sql
CREATE DATABASE staffos_dev;
\q
```

**Alternative (one command):**
```powershell
psql -U postgres -c "CREATE DATABASE staffos_dev;"
```

---

## 📝 STEP 4: Create .env File

### ⚠️ IMPORTANT: Where to Create .env File?

**Create `.env` file in the ROOT directory** (same folder as `package.json`)

**NOT in:**
- ❌ `client/` folder
- ❌ `server/` folder

**YES in:**
- ✅ Root folder (where `package.json` is located)

### How to Create:

**Option 1: Using PowerShell (Recommended)**
```powershell
# Make sure you're in project root
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"

# Create .env file
New-Item -Path .env -ItemType File -Force
```

**Option 2: Manually**
1. Open the project folder in File Explorer
2. In the root folder (where `package.json` is), create a new file
3. Name it exactly: `.env` (with the dot at the start, no extension)

### Add This Content to .env:

Open the `.env` file in any text editor (Notepad, VS Code, etc.) and paste:

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/staffos_dev"
NODE_ENV=development
SESSION_SECRET=dev-secret-key-change-in-production-min-32-characters-long
FRONTEND_URL=http://localhost:5000
```

### ⚠️ Replace These Values:

1. **`YOUR_POSTGRES_PASSWORD`** → Replace with your PostgreSQL password
   - This is the password you set when installing PostgreSQL
   - If you forgot it, you may need to reset it or check PostgreSQL configuration

2. **`SESSION_SECRET`** → Generate a random string (at least 32 characters)
   - Run this command to generate one:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Copy the output and replace `dev-secret-key-change-in-production-min-32-characters-long`

### Example .env File (After Replacement):

```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/staffos_dev"
NODE_ENV=development
SESSION_SECRET=7f3b9e2d1a4c6f8e5b2a9c4d7e1f3a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f
FRONTEND_URL=http://localhost:5000
```

**Save the file!**

---

## 🗃️ STEP 5: Initialize Database Schema

This creates all the tables in your database:

```powershell
npm run db:push
```

**Expected Output:**
```
✓ Performing 'push' migration
✓ [1/1] Creating tables...
Migration completed successfully
```

**If you get errors:**
- Check PostgreSQL is running
- Verify `.env` file exists in root and `DATABASE_URL` is correct
- Test connection: `psql -U postgres -d staffos_dev`

---

## ▶️ STEP 6: Run the Project

Start the development server:

```powershell
npm run dev
```

**What happens:**
- Backend server starts on port 5000
- Frontend dev server starts
- Both run together

**Expected Output:**
```
> rest-express@1.0.0 dev
> cross-env NODE_ENV=development tsx server/index.ts

[express] 🚀 Backend server running on http://0.0.0.0:5000
[vite] Vite dev server active
```

**Keep this terminal window open!** (Don't close it)

---

## 🌐 STEP 7: Open in Browser

Open your web browser and go to:

```
http://localhost:5000
```

You should see the StaffOS application!

---

## 📋 Complete Command Summary

Here are all the commands in order:

```powershell
# 1. Navigate to project
cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"

# 2. Install dependencies
npm install

# 3. Create database
psql -U postgres -c "CREATE DATABASE staffos_dev;"

# 4. Create .env file in ROOT directory (manually or use New-Item command)
# Then add the environment variables (see Step 4 above)

# 5. Initialize database schema
npm run db:push

# 6. Run project
npm run dev

# 7. Open browser to http://localhost:5000
```

---

## 🐛 Common Issues & Solutions

### Issue: "psql: command not found"

**Solution:**
```powershell
# Use full path to psql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE staffos_dev;"
```

### Issue: "DATABASE_URL not found"

**Solution:**
- Make sure `.env` file is in **ROOT directory** (same folder as `package.json`)
- Check file is named exactly `.env` (not `.env.txt` or `env`)
- Verify `DATABASE_URL` line in `.env` is correct

### Issue: "Cannot connect to database"

**Solutions:**
1. Check PostgreSQL is running (Services app)
2. Verify password in `DATABASE_URL` is correct
3. Test connection:
   ```powershell
   psql -U postgres -d staffos_dev
   ```

### Issue: "Port 5000 already in use"

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

---

## ✅ Verification Checklist

Before running, make sure:

- [ ] Node.js installed (`node --version` shows v20+)
- [ ] PostgreSQL 18 installed and running
- [ ] Database `staffos_dev` created
- [ ] `.env` file created in **ROOT directory** (not in client/ or server/)
- [ ] `DATABASE_URL` in `.env` has correct password
- [ ] `npm install` completed successfully
- [ ] `npm run db:push` completed successfully

---

## 📁 File Structure (Important!)

```
Candidate-Dashboard/              ← ROOT DIRECTORY
├── .env                         ← CREATE .env HERE (in root!)
├── package.json                 ← Same level as .env
├── drizzle.config.ts
├── client/                      ← Frontend folder
│   └── src/
├── server/                      ← Backend folder
│   └── index.ts
└── shared/
    └── schema.ts
```

**Remember: `.env` goes in the ROOT, not in `client/` or `server/`!**

---

## 🎯 That's It!

Once you complete these steps, your project should be running at `http://localhost:5000`

If you encounter any issues, check the error messages in the terminal - they usually tell you exactly what's wrong!

