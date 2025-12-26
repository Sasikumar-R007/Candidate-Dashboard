# 🔧 Database Setup Fix for Windows PowerShell

## Problem: psql Command Not Working

The issue is PowerShell syntax. Here are the correct ways to run it:

---

## ✅ Solution 1: Use & Operator (Recommended)

In PowerShell, when calling an executable with a path that has spaces, use `&`:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE staffos_dev;"
```

**This will prompt you for your PostgreSQL password.**

---

## ✅ Solution 2: Use pgAdmin (Easier - No Command Line)

If you installed PostgreSQL with pgAdmin (default installation), you can create the database visually:

1. **Open pgAdmin 4** (search in Start Menu)
2. **Connect to PostgreSQL server:**
   - Right-click on "PostgreSQL 18" → Connect
   - Enter your PostgreSQL password (the one you set during installation)
3. **Create Database:**
   - Right-click on "Databases" → Create → Database
   - Name: `staffos_dev`
   - Click "Save"

**Done!** No command line needed.

---

## ✅ Solution 3: Use SQL Shell (psql) GUI

1. **Open "SQL Shell (psql)"** from Start Menu
2. **Press Enter** for each prompt (uses defaults):
   - Server: `localhost`
   - Database: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: **Enter your PostgreSQL password**
3. **Type this command:**
   ```sql
   CREATE DATABASE staffos_dev;
   ```
4. **Press Enter**
5. **Type `\q` and press Enter** to exit

---

## 🔑 Where to Find Your PostgreSQL Password?

### Option 1: You Set It During Installation
- When you installed PostgreSQL 18, you were asked to set a password for the `postgres` user
- **This is the password you need**
- If you forgot it, see Option 2 below

### Option 2: Check PostgreSQL Configuration
The password is stored in PostgreSQL, but you can't "see" it directly. However:

1. **Try common defaults:**
   - `postgres` (common default)
   - `admin`
   - `password`
   - `root`

2. **Reset the password** (if you forgot):
   - Open pgAdmin
   - Right-click PostgreSQL server → Properties
   - Or use Windows Services to reset

### Option 3: Use Windows Authentication (Advanced)
If you're logged in as a Windows admin, you might be able to connect without password:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres
```

---

## 🎯 Recommended: Use pgAdmin (Easiest Method)

**Steps:**
1. Open **pgAdmin 4** from Start Menu
2. Enter your password when prompted
3. Right-click **Databases** → **Create** → **Database**
4. Name: `staffos_dev`
5. Click **Save**

**That's it!** Database created.

---

## ✅ After Creating Database

Once the database is created (using any method above), continue with:

```powershell
# Create .env file (if not done)
# Then run:
npm run db:push
```

---

## 🔍 Verify Database Was Created

To verify the database exists, use pgAdmin:
1. Open pgAdmin
2. Expand "Databases"
3. You should see `staffos_dev` listed

Or use PowerShell:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -l
```
This lists all databases. You should see `staffos_dev` in the list.

