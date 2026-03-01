-- ============================================
-- MIGRATION SQL - Add Logo Column to Clients
-- ============================================
-- Run this on BOTH databases:
-- 1. Dev (Neon): neondb
-- 2. Staging (Render): staffos_staging
-- ============================================

-- Add logo column (text field for logo URL)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

-- Add comment to column for documentation
COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';

-- ============================================
-- VERIFICATION (Run after migration)
-- ============================================
-- This query should return one row if migration succeeded

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'logo';

-- Expected result:
-- column_name | data_type
-- logo         | text

