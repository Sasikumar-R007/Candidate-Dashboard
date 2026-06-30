-- Employment Type and Work Mode for employee master data
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_type text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_mode text;
