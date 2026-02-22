# Correct Way to Connect to psql

## ❌ What You're Doing Wrong:
You're pasting `psql -U postgres -d staffos_dev` into the prompts. Don't do that!

## ✅ Correct Way:

### Option 1: Let psql prompt you (Easiest)

1. **In PowerShell/Terminal, just type:**
   ```bash
   psql
   ```

2. **When it asks for Server, press Enter** (uses localhost)

3. **When it asks for Database, type:** `staffos_dev` then Enter

4. **When it asks for Port, press Enter** (uses 5432)

5. **When it asks for Username, press Enter** (uses postgres)

6. **When it asks for Password, type your password** (Sasi@0208) - it won't show as you type

7. **You should see:** `staffos_dev=#`

8. **NOW paste the SQL:**
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

9. **Press Enter**

10. **Type `\q` to exit**

---

### Option 2: One command with all parameters (Faster)

**In PowerShell, run this:**
```powershell
$env:PGPASSWORD="Sasi@0208"; psql -U postgres -d staffos_dev
```

Then paste the SQL when you see `staffos_dev=#`

---

### Option 3: Run SQL directly (Fastest)

**In PowerShell, run this:**
```powershell
$env:PGPASSWORD="Sasi@0208"; psql -U postgres -d staffos_dev -c "CREATE TABLE IF NOT EXISTS `"session`" (`"sid`" varchar NOT NULL COLLATE `"default`", `"sess`" json NOT NULL, `"expire`" timestamp(6) NOT NULL) WITH (OIDS=FALSE); ALTER TABLE `"session`" ADD CONSTRAINT `"session_pkey`" PRIMARY KEY (`"sid`") NOT DEFERRABLE INITIALLY IMMEDIATE; CREATE INDEX IF NOT EXISTS `"IDX_session_expire`" ON `"session`" (`"expire`");"
```

This runs the SQL directly without opening psql!

---

## Quick Summary:

**Don't paste commands into prompts!**

1. Type `psql` in terminal
2. Answer the prompts (Enter for defaults, type `staffos_dev` for database)
3. Enter password
4. Wait for `staffos_dev=#` prompt
5. THEN paste SQL
6. Press Enter
7. Type `\q` to exit

