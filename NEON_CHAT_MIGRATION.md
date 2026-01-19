# Chat Feature Migration for Neon Database

## 🎯 Quick Steps for Neon

Since you're using **Neon** (not Render), here's the easiest way to run the migration:

## Step 1: Run Migration in Neon Console

1. **Go to Neon Console:**
   - Visit: https://console.neon.tech
   - Log in to your account

2. **Select Your Project:**
   - Click on your project (the one with your StaffOS database)

3. **Open SQL Editor:**
   - Click **"SQL Editor"** in the left sidebar
   - Or go to: Your Project → SQL Editor

4. **Run the Migration SQL:**
   - Copy and paste this SQL into the editor:

```sql
-- Add delivered_at column to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS delivered_at TEXT;

-- Add read_at column to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS read_at TEXT;

-- Create chat_unread_counts table
CREATE TABLE IF NOT EXISTS chat_unread_counts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR NOT NULL,
  participant_id TEXT NOT NULL,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_read_at TEXT,
  updated_at TEXT NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_unread_counts_room_participant 
ON chat_unread_counts(room_id, participant_id);
```

5. **Click "Run"** button (or press Ctrl+Enter / Cmd+Enter)

6. **Verify Success:**
   - You should see "Success" message
   - No errors should appear

## Step 2: Verify Migration

Run this in Neon SQL Editor to verify:

```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND column_name IN ('delivered_at', 'read_at');

-- Check if table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'chat_unread_counts';
```

You should see:
- `delivered_at` and `read_at` columns in the first query
- `chat_unread_counts` table in the second query

## Step 3: Deploy to Vercel and Render

After migration is complete:

1. **Commit and push your code:**
   ```bash
   git add .
   git commit -m "Add chat delivery/read receipts and unread indicators"
   git push
   ```

2. **Vercel:** Will auto-deploy on push ✅

3. **Render:** Will auto-deploy on push ✅

## Alternative: Using Neon CLI (If you prefer command line)

If you have Neon CLI installed:

```bash
# Install Neon CLI (if not installed)
npm install -g neonctl

# Login to Neon
neonctl auth

# Run migration
neonctl sql --project-id YOUR_PROJECT_ID < server/migrations/add_chat_status_fields.sql
```

But the **web console method (Step 1) is much easier!** ✅

## Troubleshooting

### "Column already exists" error
- ✅ **This is fine!** The migration already ran
- You can proceed with deployment

### "Table already exists" error
- ✅ **This is fine!** The table was already created
- You can proceed with deployment

### Can't find SQL Editor
- Make sure you're logged into Neon
- Click on your project first
- SQL Editor is in the left sidebar

## Summary

1. ✅ Go to Neon Console → SQL Editor
2. ✅ Run the migration SQL
3. ✅ Verify it worked
4. ✅ Push code to git
5. ✅ Vercel and Render auto-deploy

**That's it!** No terminal commands needed - just use Neon's web interface! 🚀

