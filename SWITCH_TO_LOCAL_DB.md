# Switch Back to Local Database

## 🔄 Change .env File

### Step 1: Update DATABASE_URL

Change your `.env` file from Neon (production) back to local database:

**From (Neon - Production):**
```env
DATABASE_URL=postgresql://neondb_owner:npg_U7ZcveYr8mNq@ep-billowing-moon-a1vzhwf0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**To (Local):**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/staffos_dev
```

**Important**: Replace `password` and `staffos_dev` with your actual local database credentials.

---

## 🔍 Why Migration Didn't Update Anything

The migration showed all candidates were skipped. This could mean:

1. **Database has actual values** (not null/empty)
   - But UI still shows "Not Available" 
   - This means the values might be stored but are invalid/bad data

2. **The `needsUpdate` function didn't catch them**
   - Maybe values are stored as empty strings `""` vs `null`
   - Or there are whitespace/formatting issues

3. **The issue is in the UI mapping, not the database**
   - Database has values, but UI mapping shows "Not Available"

---

## 🛠️ Let's Debug: Check What's Actually in Database

After switching to local DB, let's check what's actually stored:

### Option 1: Check via SQL (if you have database tool)
```sql
SELECT id, "fullName", email, designation, location, company, experience 
FROM candidates 
WHERE "fullName" IS NULL OR "fullName" = '' OR "fullName" = 'Not Available'
LIMIT 10;
```

### Option 2: Create a Debug Script

I can create a script to check what's actually in your database and why the migration skipped them.

---

## 📝 Your .env Should Look Like:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/your_database_name
NODE_ENV=development
FROM_EMAIL=StaffOS <onboarding@resend.dev>
# ... other variables
```

---

## ✅ After Switching

1. **Test your app** - Make sure it connects to local database
2. **Check a few profiles** - See what data they have
3. **We can debug** - Figure out why migration didn't update them

---

**Want me to create a debug script to check what's actually in the database?**

