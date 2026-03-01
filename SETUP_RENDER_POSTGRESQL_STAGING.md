# Setup Render PostgreSQL for Staging

## Step 1: Create Render PostgreSQL Database

1. Go to **Render Dashboard** → Click **"New +"** → Select **"PostgreSQL"**

2. Fill in the details:
   - **Name:** `staffos-staging-db`
   - **Database:** `staffos_staging`
   - **User:** `staffos_user`
   - **Region:** Same region as your `staffos-backend-staging` (check your backend region)
   - **PostgreSQL Version:** 16 (or latest)
   - **Plan:** Select **"Starter"** ($7/month)
   - **Databases:** Leave default

3. Click **"Create Database"**

4. Wait 2-3 minutes for database to be created

---

## Step 2: Get Connection String

1. Once created, go to your database dashboard
2. Find **"Connections"** section
3. Copy the **"External Database URL"** (looks like: `postgresql://user:password@host:port/database?sslmode=require`)

**Save this URL - you'll need it!**

---

## Step 3: Run SQL Script on Render Database

You have 3 options (choose easiest):

### Option A: Using psql (if you have it installed)

```bash
# In your terminal, run:
psql "your-external-database-url-here" -f SETUP_PRODUCTION_DATABASE.sql
```

### Option B: Using DBeaver (Free SQL Client)

1. Download DBeaver: https://dbeaver.io/download/
2. Install and open DBeaver
3. Click **"New Database Connection"** → Select **"PostgreSQL"**
4. Paste your Render External Database URL in the connection field
5. Test connection → Click **"Finish"**
6. Right-click on your database → **"SQL Editor"** → **"New SQL Script"**
7. Open `SETUP_PRODUCTION_DATABASE.sql` → Copy all content
8. Paste in DBeaver SQL Editor → Click **"Execute SQL Script"** (or F5)

### Option C: Using pgAdmin (Free)

1. Download pgAdmin: https://www.pgadmin.org/download/
2. Install and open pgAdmin
3. Right-click **"Servers"** → **"Create"** → **"Server"**
4. In **"Connection"** tab, paste your Render connection details
5. Click **"Save"**
6. Right-click your database → **"Query Tool"**
7. Open `SETUP_PRODUCTION_DATABASE.sql` → Copy all → Paste in Query Tool
8. Click **"Execute"** (F5)

---

## Step 4: Verify Tables Created

Run this in your SQL client:

```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should return **40+ tables**

Also verify session table exists:
```sql
SELECT * FROM session LIMIT 1;
```
(Should return empty, but no error)

---

## Step 5: Update Staging Backend Environment

1. Go to **Render Dashboard** → **staffos-backend-staging** → **Environment**

2. Find `DATABASE_URL` environment variable

3. Update it to your new Render PostgreSQL External Database URL:
   ```
   postgresql://staffos_user:password@host:port/staffos_staging?sslmode=require
   ```

4. Click **"Save Changes"**

5. Render will automatically redeploy your backend

---

## Step 6: Test Staging

1. Wait for backend to redeploy (2-3 minutes)
2. Visit your staging frontend URL
3. Try to create an admin user
4. Verify everything works

---

## ✅ Success Checklist

- [ ] Render PostgreSQL database created
- [ ] SQL script executed successfully
- [ ] 40+ tables verified
- [ ] Backend `DATABASE_URL` updated
- [ ] Backend redeployed
- [ ] Staging site works correctly

---

## Next Steps (After Staging Works)

Once staging is working perfectly:
1. Create another Render PostgreSQL for **production**
2. Run same SQL script
3. Update production backend `DATABASE_URL`
4. You're done! 🎉

---

## Troubleshooting

**Connection refused?**
- Make sure you're using **External Database URL** (not Internal)
- Check if database status is "Available"

**SQL script fails?**
- Try running in smaller parts (use the PART1-PART6 files)
- Check for any error messages

**Backend can't connect?**
- Verify `DATABASE_URL` is correct in Render environment
- Check backend logs in Render dashboard

