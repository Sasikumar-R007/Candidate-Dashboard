-- Employee account hold fields (Admin User Management — Hold / Resume)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS hold_message text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS hold_until text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS held_at text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS held_by_employee_id varchar;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS logout_scheduled_at text;
