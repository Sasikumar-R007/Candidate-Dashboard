-- Migration: Add jd_file and jd_text columns to requirements table
-- Date: 2025-01-01

-- Add jd_file column (text field for JD file URL)
ALTER TABLE requirements 
ADD COLUMN IF NOT EXISTS jd_file TEXT;

-- Add jd_text column (text field for JD text content)
ALTER TABLE requirements 
ADD COLUMN IF NOT EXISTS jd_text TEXT;

-- Add comment to columns for documentation
COMMENT ON COLUMN requirements.jd_file IS 'JD file URL for client-submitted job descriptions';
COMMENT ON COLUMN requirements.jd_text IS 'JD text content for client-submitted job descriptions';

