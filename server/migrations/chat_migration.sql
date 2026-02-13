-- =====================================================
-- CHAT FEATURE DATABASE MIGRATION
-- =====================================================
-- Run this SQL in your database (Neon, PostgreSQL, etc.)
-- This adds the missing chat columns and table
-- =====================================================

-- Step 1: Add delivered_at column to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS delivered_at TEXT;

-- Step 2: Add read_at column to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS read_at TEXT;

-- Step 3: Create chat_unread_counts table
CREATE TABLE IF NOT EXISTS chat_unread_counts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR NOT NULL,
  participant_id TEXT NOT NULL,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_read_at TEXT,
  updated_at TEXT NOT NULL
);

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_unread_counts_room_participant 
ON chat_unread_counts(room_id, participant_id);

-- =====================================================
-- VERIFICATION (Run after migration)
-- =====================================================
-- Verify columns were added:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'chat_messages' 
-- AND column_name IN ('delivered_at', 'read_at');

-- Verify table was created:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name = 'chat_unread_counts';
-- =====================================================





