# Chat Feature Database Migration Instructions

## 🎯 Quick Migration Guide

Before redeploying to Vercel and Render, you need to run a database migration to add the new chat features.

## What Changed?

1. **Added columns to `chat_messages` table:**
   - `delivered_at` - Tracks when message was delivered
   - `read_at` - Tracks when message was read

2. **Created new `chat_unread_counts` table:**
   - Tracks unread message counts per user per room

## Migration Steps

### Option 1: Using SQL File (Recommended for Production)

1. **Connect to your production database** (Render PostgreSQL):
   - Go to Render Dashboard → Your Database → Connect
   - Copy the connection string or use psql

2. **Run the migration SQL:**
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

### Option 2: Using Render Database Console

1. Go to **Render Dashboard** → Your PostgreSQL Database
2. Click **"Connect"** → **"psql"** or **"Query"**
3. Copy and paste the SQL from `server/migrations/add_chat_status_fields.sql`
4. Execute the SQL

### Option 3: Using Database GUI (pgAdmin, DBeaver, etc.)

1. Connect to your Render database
2. Open SQL query tool
3. Run the SQL from `server/migrations/add_chat_status_fields.sql`

## After Migration

1. ✅ Verify the migration:
   ```sql
   -- Check if columns exist
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'chat_messages' 
   AND column_name IN ('delivered_at', 'read_at');
   
   -- Check if table exists
   SELECT * FROM chat_unread_counts LIMIT 1;
   ```

2. ✅ **Then redeploy:**
   - **Vercel**: Push to git or trigger redeploy
   - **Render**: Push to git or manually redeploy

## Deployment Checklist

- [ ] Run database migration (add columns and create table)
- [ ] Verify migration succeeded
- [ ] Commit all code changes to git
- [ ] Push to repository
- [ ] Vercel will auto-deploy (or trigger manually)
- [ ] Render will auto-deploy (or trigger manually)

## No Terminal Commands Needed!

You don't need to run anything in terminal before deploying. The migration needs to be run **directly on your production database** (Render PostgreSQL).

The code changes are already in your files - just:
1. Run the SQL migration on your database
2. Push to git
3. Vercel and Render will auto-deploy

## Troubleshooting

### Error: "Column already exists"
- ✅ This is fine! The migration already ran
- You can proceed with deployment

### Error: "Table already exists"
- ✅ This is fine! The table was already created
- You can proceed with deployment

### Can't connect to database
- Check your Render database connection string
- Make sure database is running
- Use Render's built-in query tool instead

