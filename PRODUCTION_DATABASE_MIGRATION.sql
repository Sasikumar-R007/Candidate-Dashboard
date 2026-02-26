-- =====================================================
-- PRODUCTION DATABASE MIGRATION - URGENT
-- =====================================================
-- Run this in your PRODUCTION database (Neon) to fix all errors
-- =====================================================

-- 1. Add last_viewed_at column to candidates table
-- This fixes: "column last_viewed_at does not exist" errors in search
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS last_viewed_at TEXT;

COMMENT ON COLUMN candidates.last_viewed_at IS 'Timestamp when candidate profile was last viewed';

-- =====================================================
-- VERIFICATION QUERIES (Run after migration to verify)
-- =====================================================
-- Check if column was added successfully:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'candidates' AND column_name = 'last_viewed_at';

-- =====================================================
-- Expected Result:
-- column_name    | data_type
-- ---------------+----------
-- last_viewed_at | text
-- =====================================================



