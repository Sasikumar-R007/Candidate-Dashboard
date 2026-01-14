-- =====================================================
-- CRITICAL DATABASE MIGRATION - RUN BEFORE DEPLOYMENT
-- =====================================================
-- This migration fixes all missing columns causing 500 errors in production
-- Run this in your PRODUCTION database before deploying
-- =====================================================

-- 1. Fix employees table - Add last_login_at column
-- This fixes: POST /api/admin/clients/credentials 500 errors
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS last_login_at TEXT;

COMMENT ON COLUMN employees.last_login_at IS 'Last login timestamp for tracking user activity';

-- 2. Fix requirements table - Add JD file columns
-- This fixes: 
--   - GET /api/admin/requirements 500 errors
--   - GET /api/admin/client-jds 500 errors  
--   - GET /api/admin/daily-metrics 500 errors
ALTER TABLE requirements 
ADD COLUMN IF NOT EXISTS jd_file TEXT;

ALTER TABLE requirements 
ADD COLUMN IF NOT EXISTS jd_text TEXT;

COMMENT ON COLUMN requirements.jd_file IS 'JD file URL for client-submitted job descriptions';
COMMENT ON COLUMN requirements.jd_text IS 'JD text content for client-submitted job descriptions';

-- =====================================================
-- VERIFICATION QUERIES (Run after migration to verify)
-- =====================================================
-- Check if columns were added successfully:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'employees' AND column_name = 'last_login_at';

-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'requirements' AND column_name IN ('jd_file', 'jd_text');
-- =====================================================

