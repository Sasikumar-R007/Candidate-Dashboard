# Migrate Old Database to Production Database
## Complete Data Migration Guide

This guide will help you copy ALL data (tables, users, everything) from your old database to the new production database.

---

## 📋 Prerequisites

- Old database connection string (from Neon: `staffosdemo` or old database)
- New production database connection string (from Neon: `staffos-production`)
- Access to Neon Dashboard

---

## 🎯 Method 1: Using Neon Dashboard (Easiest - Recommended)

### Step 1: Create Backup Branch from Old Database

1. Go to **Neon Dashboard**: https://console.neon.tech
2. Select your **OLD database project** (the one with all your data)
3. Click **"Branches"** in left sidebar
4. Click **"Create Branch"**
5. Name it: `backup-before-migration`
6. Click **"Create"**
7. ✅ This creates a snapshot of your old database

### Step 2: Export Data from Old Database

1. In Neon Dashboard, select your **OLD database project**
2. Go to **"SQL Editor"**
3. Run this to get all table names:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```
4. Copy the list of tables (you'll need this)

### Step 3: Use Neon's Data Export Feature

**Option A: Export via SQL (for specific tables)**

1. In **OLD database** SQL Editor, run:
   ```sql
   -- Export users table
   COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;
   ```
2. Copy the output and save to a file
3. Repeat for each table

**Option B: Use pg_dump (Better - exports everything)**

See Method 2 below for pg_dump approach.

---

## 🚀 Method 2: Using pg_dump (Best - Exports Everything)

### Step 1: Install PostgreSQL Tools (if not installed)

**For Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install it (includes `pg_dump` and `psql` tools)
3. Or use Chocolatey: `choco install postgresql`

**Or use online tool:**
- Use Neon's built-in export (see Method 1)

### Step 2: Export from Old Database

1. **Get your OLD database connection string:**
   - Go to Neon Dashboard → OLD database project
   - Copy connection string

2. **Open PowerShell/Command Prompt**

3. **Export everything:**
   ```powershell
   # Replace with your OLD database connection string
   $oldDbUrl = "postgresql://user:password@host.neon.tech/dbname?sslmode=require"
   
   # Export to SQL file
   pg_dump "$oldDbUrl" > old_database_backup.sql
   ```

   **Or if pg_dump is not in PATH:**
   ```powershell
   # Find pg_dump location (usually in PostgreSQL install folder)
   & "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" "$oldDbUrl" > old_database_backup.sql
   ```

### Step 3: Import to New Production Database

1. **Get your NEW production database connection string:**
   - Go to Neon Dashboard → `staffos-production` project
   - Copy connection string

2. **Import the backup:**
   ```powershell
   # Replace with your NEW database connection string
   $newDbUrl = "postgresql://user:password@host.neon.tech/dbname?sslmode=require"
   
   # Import from SQL file
   psql "$newDbUrl" < old_database_backup.sql
   ```

   **Or if psql is not in PATH:**
   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" "$newDbUrl" < old_database_backup.sql
   ```

---

## 🎯 Method 3: Using Neon SQL Editor (Manual - For Small Databases)

If you have a small amount of data, you can copy table by table:

### Step 1: Export Data from Each Table

1. Go to **OLD database** → SQL Editor
2. For each table, run:
   ```sql
   -- Example: Export employees table
   SELECT * FROM employees;
   ```
3. Copy the results

### Step 2: Import to New Database

1. Go to **NEW database** (`staffos-production`) → SQL Editor
2. First, create the table structure (if not exists):
   ```sql
   -- Run: npm run db:push (locally with NEW database URL)
   ```
3. Then insert data:
   ```sql
   -- Example: Insert employees
   INSERT INTO employees (id, employee_id, name, email, ...) 
   VALUES 
   ('id1', 'SCE001', 'Name1', 'email1@example.com', ...),
   ('id2', 'SCE002', 'Name2', 'email2@example.com', ...);
   ```

**Note:** This is tedious for large databases. Use Method 2 instead.

---

## ✅ Recommended Complete Process

### Step-by-Step (Using Method 2 - pg_dump):

1. **Backup Old Database:**
   ```powershell
   # Export everything from old database
   pg_dump "OLD_DATABASE_CONNECTION_STRING" > backup_old_db.sql
   ```

2. **Create Tables in New Database:**
   ```powershell
   # Set NEW database URL temporarily
   $env:DATABASE_URL="NEW_PRODUCTION_DATABASE_CONNECTION_STRING"
   
   # Create all tables from schema
   cd "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
   npm run db:push
   ```

3. **Import Data:**
   ```powershell
   # Import all data
   psql "NEW_PRODUCTION_DATABASE_CONNECTION_STRING" < backup_old_db.sql
   ```

4. **Create Session Table:**
   - Go to Neon → `staffos-production` → SQL Editor
   - Run the SQL from `CREATE_SESSION_TABLE.sql`

5. **Verify:**
   ```sql
   -- Check data was imported
   SELECT COUNT(*) FROM employees;
   SELECT COUNT(*) FROM candidates;
   SELECT COUNT(*) FROM users;
   -- etc.
   ```

---

## 🔍 Verification Checklist

After migration, verify:

- [ ] All tables exist in new database
- [ ] User count matches: `SELECT COUNT(*) FROM users;`
- [ ] Employee count matches: `SELECT COUNT(*) FROM employees;`
- [ ] Candidate count matches: `SELECT COUNT(*) FROM candidates;`
- [ ] Can login with existing credentials
- [ ] Session table exists: `SELECT * FROM session LIMIT 1;`

---

## 🚨 Important Notes

1. **Don't delete old database yet** - Keep it as backup until you verify everything works
2. **Test login** - Make sure you can login with existing users
3. **Check foreign keys** - Make sure relationships between tables are preserved
4. **Update Render backend** - Make sure `staffos-backendd` points to new database

---

## 🆘 Troubleshooting

### Error: "Table already exists"
- The table structure already exists from `db:push`
- Use `--clean` flag with pg_dump, or drop tables first (CAREFUL!)

### Error: "Permission denied"
- Check your Neon connection string has write permissions
- Make sure you're using the main database user

### Error: "Connection timeout"
- Check your internet connection
- Try exporting/importing in smaller chunks

### Data missing after import
- Check if foreign key constraints failed
- Verify all tables were imported
- Check pg_dump output for errors

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify connection strings are correct
3. Make sure both databases are accessible
4. Try exporting/importing one table at a time to isolate issues



