-- ============================================
-- QUICK MIGRATION: Add Logo Column to Clients
-- ============================================
-- Copy this entire file and paste into pgAdmin Query Tool
-- Then click "Execute" (or press F5)
-- ============================================

-- Add logo column (text field for logo URL)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

-- Add comment to column for documentation
COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';

-- ============================================
-- VERIFICATION QUERY (Optional - run after migration)
-- ============================================
-- Uncomment the lines below to verify the migration worked:

-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'clients' AND column_name = 'logo';

-- Expected result: Should return one row with column_name='logo' and data_type='text'

