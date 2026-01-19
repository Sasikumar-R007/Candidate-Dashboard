-- Migration: Add delivery/read status to chat messages and create unread counts table
-- Date: 2024
-- Description: Adds deliveredAt and readAt fields to chat_messages, and creates chat_unread_counts table
-- 
-- IMPORTANT: Run each statement SEPARATELY in Neon SQL Editor (one at a time)
-- If you get "already exists" errors, that's fine - it means the migration already ran

-- Step 1: Add delivered_at column to chat_messages table
ALTER TABLE chat_messages ADD COLUMN delivered_at TEXT;

-- Step 2: Add read_at column to chat_messages table  
ALTER TABLE chat_messages ADD COLUMN read_at TEXT;

-- Step 3: Create chat_unread_counts table
CREATE TABLE chat_unread_counts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR NOT NULL,
  participant_id TEXT NOT NULL,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_read_at TEXT,
  updated_at TEXT NOT NULL
);

-- Step 4: Create index for faster lookups
CREATE INDEX idx_chat_unread_counts_room_participant 
ON chat_unread_counts(room_id, participant_id);

