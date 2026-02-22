# Fix Session Table Error

## Problem
The error `{"message":"relation \"session\" does not exist"}` occurs because the `session` table hasn't been created in your local database.

## Solution

The session table is used by `express-session` with PostgreSQL store. You have two options:

### Option 1: Let it auto-create (Recommended)
The session store is configured with `createTableIfMissing: true`, so it should create the table automatically when you restart your server. However, if it didn't work, use Option 2.

### Option 2: Create manually using SQL

Run this SQL in your PostgreSQL database:

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

### How to run SQL:

**Using psql:**
```bash
psql -U postgres -d staffos_dev -f CREATE_SESSION_TABLE.sql
```

**Or connect to your database and run:**
```bash
psql -U postgres -d staffos_dev
```
Then paste the SQL commands above.

**Or using a database GUI tool:**
- Open your database in pgAdmin, DBeaver, or similar
- Run the SQL commands

---

## After creating the table:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. The error should be gone and sessions will work properly.

---

## Note:
The session table is used for:
- User authentication sessions
- Tracking active users
- Session persistence across server restarts

This table is separate from your application tables and is managed by `express-session`.

