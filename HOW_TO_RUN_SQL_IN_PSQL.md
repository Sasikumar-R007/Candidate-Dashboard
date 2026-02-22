# How to Run SQL in psql (Correct Steps)

## The Problem
You pasted the SQL at the connection prompt. You need to connect FIRST, then run SQL.

## Correct Steps:

### Step 1: Connect to psql
When you see:
```
Server [localhost]: 
Database [postgres]: 
Port [5432]: 
Username [postgres]: 
```

**Just press Enter for each prompt** (or type the values if different):
- Server: Press Enter (uses localhost)
- Database: Type `staffos_dev` then Enter
- Port: Press Enter (uses 5432)
- Username: Press Enter (uses postgres)

### Step 2: Enter password
You'll be prompted for password. Type your PostgreSQL password (it won't show as you type).

### Step 3: You should see the psql prompt
```
staffos_dev=#
```

### Step 4: NOW paste the SQL
Copy and paste this entire block:

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

### Step 5: Press Enter
You should see:
```
CREATE TABLE
ALTER TABLE
CREATE INDEX
```

### Step 6: Exit psql
Type `\q` and press Enter

---

## Alternative: One-Line Command

If you want to do it in one command:

```bash
psql -U postgres -d staffos_dev -c "CREATE TABLE IF NOT EXISTS \"session\" (\"sid\" varchar NOT NULL COLLATE \"default\", \"sess\" json NOT NULL, \"expire\" timestamp(6) NOT NULL) WITH (OIDS=FALSE); ALTER TABLE \"session\" ADD CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\") NOT DEFERRABLE INITIALLY IMMEDIATE; CREATE INDEX IF NOT EXISTS \"IDX_session_expire\" ON \"session\" (\"expire\");"
```

But the step-by-step method above is easier!

---

## Quick Summary:
1. Connect to psql (press Enter for defaults, type `staffos_dev` for database)
2. Enter password
3. Wait for `staffos_dev=#` prompt
4. Paste SQL
5. Press Enter
6. Type `\q` to exit

