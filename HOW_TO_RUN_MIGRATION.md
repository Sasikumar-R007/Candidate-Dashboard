# How to Run the Database Migration

## 🎯 Quick Answer: Where to Run the Migration

You have **3 options** to run the migration. Choose the one that's easiest for you:

---

## **Option 1: Using Node.js Script (Easiest - Recommended)**

I've created a script that will run the migration for you automatically.

### Steps:

1. **Open Terminal/PowerShell** in your project root directory:
   ```
   C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard
   ```

2. **Run the migration script:**
   ```powershell
   node server/run-migration.js
   ```

3. **That's it!** The script will:
   - Connect to your database (using DATABASE_URL from .env)
   - Run the migration SQL
   - Verify the columns were added
   - Show you the results

**Expected Output:**
```
🔄 Connecting to database...
📝 Running migration: Adding jd_file and jd_text columns...
✅ Migration completed successfully!
✅ Columns jd_file and jd_text have been added to the requirements table
✅ Verification: Both columns exist in the database
   - jd_file: text
   - jd_text: text
```

---

## **Option 2: Using Database GUI Tool (Visual Method)**

If you prefer a visual interface:

### For pgAdmin (PostgreSQL GUI):

1. **Open pgAdmin**
2. **Connect to your database** (the one from your DATABASE_URL)
3. **Right-click on your database** → **Query Tool**
4. **Copy and paste this SQL:**
   ```sql
   ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_file TEXT;
   ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_text TEXT;
   ```
5. **Click the "Execute" button** (or press F5)
6. **Done!**

### For DBeaver or other SQL tools:

Same process - just connect to your database and run the SQL above.

---

## **Option 3: Using psql Command Line**

If you have PostgreSQL command line tools installed:

### Steps:

1. **Open PowerShell or Command Prompt**

2. **Find your DATABASE_URL** from your `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/staffos_dev"
   ```

3. **Extract the connection details:**
   - User: `postgres`
   - Password: `password` (from your .env)
   - Host: `localhost`
   - Port: `5432`
   - Database: `staffos_dev`

4. **Run psql:**
   ```powershell
   psql -U postgres -d staffos_dev -h localhost -p 5432
   ```
   (Enter your password when prompted)

5. **Once connected, run:**
   ```sql
   ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_file TEXT;
   ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_text TEXT;
   ```

6. **Type `\q` to exit**

---

## **Option 4: Using Neon Console (If using Neon Database)**

If you're using Neon (cloud PostgreSQL):

1. **Go to:** https://console.neon.tech
2. **Select your project**
3. **Click "SQL Editor"** in the left sidebar
4. **Paste this SQL:**
   ```sql
   ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_file TEXT;
   ALTER TABLE requirements ADD COLUMN IF NOT EXISTS jd_text TEXT;
   ```
5. **Click "Run"**
6. **Done!**

---

## **Which Option Should You Use?**

- **Option 1 (Node.js script)** - ✅ **BEST** if you want the easiest method
- **Option 2 (GUI tool)** - ✅ **BEST** if you prefer visual tools
- **Option 3 (psql)** - ✅ **BEST** if you're comfortable with command line
- **Option 4 (Neon Console)** - ✅ **BEST** if using Neon cloud database

---

## **After Running Migration:**

1. **Restart your server** (if it's running)
2. **Try uploading a JD** from the Client page
3. **It should work now!** ✅

---

## **Troubleshooting:**

### Error: "DATABASE_URL not found"
- Make sure your `.env` file exists in the project root
- Make sure it contains `DATABASE_URL=...`

### Error: "Connection refused"
- Make sure your PostgreSQL database is running
- Check your DATABASE_URL is correct

### Error: "Column already exists"
- This is fine! It means the migration already ran
- You can proceed - the columns are already there

---

## **Need Help?**

If you're not sure which database you're using, check your `.env` file:
- If it says `localhost` → Use Option 1, 2, or 3
- If it says `neon.tech` → Use Option 4
- If it says `render.com` or other cloud → Use Option 2 or 4

