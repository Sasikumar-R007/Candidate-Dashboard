-- Add last_login_at column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_login_at TEXT;
COMMENT ON COLUMN employees.last_login_at IS 'Last login timestamp for tracking user activity';

