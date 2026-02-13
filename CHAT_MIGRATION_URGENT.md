# ⚠️ URGENT: Chat Database Migration Required

## The Problem
Your chat feature is failing because these database objects are missing:
1. `chat_unread_counts` table doesn't exist
2. `delivered_at` column doesn't exist in `chat_messages`
3. `read_at` column doesn't exist in `chat_messages`

## The Solution
Run this SQL migration in your database:

### For Neon Database:
1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor"
4. Copy and paste the SQL from `server/migrations/chat_migration.sql`
5. Click "Run"

### For PostgreSQL/Render:
1. Connect to your database
2. Run the SQL from `server/migrations/chat_migration.sql`

## Quick Migration SQL

```sql
-- Add delivered_at column
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS delivered_at TEXT;

-- Add read_at column
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_chat_unread_counts_room_participant 
ON chat_unread_counts(room_id, participant_id);
```

## After Migration
1. Restart your server
2. Try sending a chat message again
3. The errors should be resolved

## Note
I've updated the code to handle missing columns gracefully, so it won't crash, but the migration is still needed for full functionality.





