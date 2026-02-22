# Quick Fix: Session Table Error

## The Problem
You're getting: `{"message":"relation \"session\" does not exist"}`

This happens because the `session` table (used for user login sessions) doesn't exist in your local database.

## Quick Solution

### Step 1: Connect to your PostgreSQL database

Open a terminal and run:
```bash
psql -U postgres -d staffos_dev
```

(Replace `staffos_dev` with your actual database name if different)

### Step 2: Run this SQL

Copy and paste this SQL into the psql prompt:

```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

### Step 3: Verify it worked

You should see:
```
CREATE TABLE
ALTER TABLE
CREATE INDEX
```

### Step 4: Exit psql
Type `\q` and press Enter

### Step 5: Restart your server
```bash
npm run dev
```

---

## Alternative: Use a Database GUI Tool

If you have pgAdmin, DBeaver, or another database tool:
1. Connect to your local database
2. Open SQL editor
3. Paste the SQL above
4. Run it

---

## Why This Happened

The `session` table should auto-create when the server starts (it's configured with `createTableIfMissing: true`), but sometimes it doesn't work on first run. Creating it manually fixes this.

---

**After creating the table, the error will be gone and your Source Resume page should work!**

