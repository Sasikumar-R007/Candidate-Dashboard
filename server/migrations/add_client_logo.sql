-- Migration: Add logo column to clients table
-- Date: 2025-01-XX
-- Description: Adds logo field to store company logo URLs

-- Add logo column (text field for logo URL)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

-- Add comment to column for documentation
COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';

