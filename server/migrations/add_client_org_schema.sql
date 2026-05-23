-- Client org schema: departments, invites, employee links, requirement assignment

CREATE TABLE IF NOT EXISTS client_departments (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  client_company_id varchar(255) NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS client_invites (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  client_company_id varchar(255) NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  invite_role text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  invited_by_employee_id varchar(255) NOT NULL,
  expires_at text NOT NULL,
  accepted_at text,
  created_at text NOT NULL
);

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS client_company_id varchar(255),
  ADD COLUMN IF NOT EXISTS client_department_id varchar(255),
  ADD COLUMN IF NOT EXISTS can_see_salary_details boolean DEFAULT false;

ALTER TABLE client_invites
  ADD COLUMN IF NOT EXISTS client_department_id varchar(255),
  ADD COLUMN IF NOT EXISTS can_see_salary_details boolean DEFAULT false;

ALTER TABLE requirements
  ADD COLUMN IF NOT EXISTS assigned_client_member_id varchar(255);

CREATE INDEX IF NOT EXISTS idx_employees_client_company_id
  ON employees (client_company_id);

CREATE INDEX IF NOT EXISTS idx_requirements_assigned_client_member_id
  ON requirements (assigned_client_member_id);
