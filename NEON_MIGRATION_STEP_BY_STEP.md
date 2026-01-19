# Neon Migration - Step by Step (Fix for "Unknown Error")

## 🔧 Problem: "Unknown error" in Neon SQL Editor

Neon's SQL Editor sometimes has issues with multiple statements. Let's run them **one at a time**.

## ✅ Solution: Run Each Statement Separately

### Step 1: Add `delivered_at` column

Run this **first** in Neon SQL Editor:

```sql
ALTER TABLE chat_messages ADD COLUMN delivered_at TEXT;
```

Click **Run**. If you see:
- ✅ **Success** → Continue to Step 2
- ⚠️ **"Column already exists"** → That's fine! Continue to Step 2
- ❌ **Error** → See troubleshooting below

---

### Step 2: Add `read_at` column

Run this **second**:

```sql
ALTER TABLE chat_messages ADD COLUMN read_at TEXT;
```

Click **Run**. If you see:
- ✅ **Success** → Continue to Step 3
- ⚠️ **"Column already exists"** → That's fine! Continue to Step 3

---

### Step 3: Create `chat_unread_counts` table

Run this **third**:

```sql
CREATE TABLE chat_unread_counts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR NOT NULL,
  participant_id TEXT NOT NULL,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_read_at TEXT,
  updated_at TEXT NOT NULL
);
```

Click **Run**. If you see:
- ✅ **Success** → Continue to Step 4
- ⚠️ **"Table already exists"** → That's fine! Continue to Step 4

---

### Step 4: Create index

Run this **fourth**:

```sql
CREATE INDEX idx_chat_unread_counts_room_participant 
ON chat_unread_counts(room_id, participant_id);
```

Click **Run**. If you see:
- ✅ **Success** → You're done! ✅
- ⚠️ **"Index already exists"** → That's fine! You're done! ✅

---

## 🔍 Verify Migration Worked

Run this to check:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND column_name IN ('delivered_at', 'read_at');
```

You should see 2 rows: `delivered_at` and `read_at`

---

## 🚨 Troubleshooting

### Error: "Column already exists"
- ✅ **This is GOOD!** The column is already there
- Skip that step and continue

### Error: "Table already exists"
- ✅ **This is GOOD!** The table is already there
- Skip that step and continue

### Error: "Permission denied"
- Make sure you're using the **main database user** (not a read-only user)
- Check your Neon project permissions

### Error: "Syntax error"
- Make sure you're copying the **entire** SQL statement
- Don't include the step numbers or dashes
- Copy only the SQL code between the ```sql blocks

### Still getting "Unknown error"?
Try this alternative approach:

1. **Check if columns already exist:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'chat_messages';
   ```

2. **If `delivered_at` and `read_at` are NOT in the list**, try without `IF NOT EXISTS`:
   ```sql
   ALTER TABLE chat_messages ADD COLUMN delivered_at TEXT;
   ALTER TABLE chat_messages ADD COLUMN read_at TEXT;
   ```

3. **Check if table exists:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'chat_unread_counts';
   ```

4. **If table doesn't exist**, create it:
   ```sql
   CREATE TABLE chat_unread_counts (
     id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
     room_id VARCHAR NOT NULL,
     participant_id TEXT NOT NULL,
     unread_count INTEGER NOT NULL DEFAULT 0,
     last_read_at TEXT,
     updated_at TEXT NOT NULL
   );
   ```

---

## ✅ After Migration Succeeds

1. **Verify everything is there:**
   ```sql
   -- Check columns
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'chat_messages' 
   AND column_name IN ('delivered_at', 'read_at');
   
   -- Check table
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'chat_unread_counts';
   ```

2. **Then deploy:**
   ```bash
   git add .
   git commit -m "Add chat delivery/read receipts"
   git push
   ```

---

## 💡 Pro Tip

If you're still having issues, you can also:
1. Use **Neon's Branch feature** to test on a branch first
2. Use a database GUI tool (DBeaver, pgAdmin) connected to Neon
3. Contact Neon support if the SQL Editor is having issues

