-- Safe sync for Render/Neon: tables + columns used by Admin, Team Leader, Recruiter, Client portals.
-- All statements are idempotent (IF NOT EXISTS).

-- ========== Team Leader / pipeline tables ==========
CREATE TABLE IF NOT EXISTS requirement_assignments (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id varchar(255) NOT NULL,
  recruiter_id varchar(255) NOT NULL,
  recruiter_name text NOT NULL,
  team_lead_id varchar(255),
  team_lead_name text,
  assigned_date text NOT NULL,
  due_date text,
  status text NOT NULL DEFAULT 'active',
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS resume_submissions (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id varchar(255) NOT NULL,
  assignment_id varchar(255),
  recruiter_id varchar(255) NOT NULL,
  recruiter_name text NOT NULL,
  candidate_id varchar(255),
  candidate_name text NOT NULL,
  candidate_email text,
  submitted_at text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  notes text,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_metrics_snapshots (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  scope_type text NOT NULL,
  scope_id varchar(255),
  scope_name text,
  delivered integer NOT NULL DEFAULT 0,
  defaulted integer NOT NULL DEFAULT 0,
  requirement_count integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  updated_at text
);

CREATE TABLE IF NOT EXISTS user_activities (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id text NOT NULL,
  actor_name text NOT NULL,
  actor_role text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  target_role text,
  related_id text,
  related_type text,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS nudges (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id varchar(255) NOT NULL,
  candidate_id varchar(255) NOT NULL,
  recruiter_id varchar(255),
  candidate_name text NOT NULL,
  job_title text NOT NULL,
  company text NOT NULL,
  current_status text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  is_responded boolean DEFAULT false,
  escalation_level text DEFAULT 'recruiter',
  last_escalated_at timestamp NOT NULL DEFAULT now(),
  created_at timestamp NOT NULL DEFAULT now(),
  responded_at timestamp
);

CREATE TABLE IF NOT EXISTS candidate_application_comments (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id varchar(255) NOT NULL,
  author_employee_id varchar(255) NOT NULL,
  author_name text NOT NULL,
  author_role text NOT NULL,
  body text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_application_comments_application_id
  ON candidate_application_comments (application_id);

CREATE INDEX IF NOT EXISTS idx_requirement_assignments_requirement_id
  ON requirement_assignments (requirement_id);

CREATE INDEX IF NOT EXISTS idx_resume_submissions_requirement_id
  ON resume_submissions (requirement_id);

-- ========== requirements ==========
ALTER TABLE requirements
  ADD COLUMN IF NOT EXISTS talent_advisor_id varchar(255),
  ADD COLUMN IF NOT EXISTS no_of_positions integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS split_requirement boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_details text,
  ADD COLUMN IF NOT EXISTS management_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS management_reason text,
  ADD COLUMN IF NOT EXISTS managed_at text,
  ADD COLUMN IF NOT EXISTS assigned_client_member_id varchar(255),
  ADD COLUMN IF NOT EXISTS jd_file text,
  ADD COLUMN IF NOT EXISTS jd_text text,
  ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

ALTER TABLE archived_requirements
  ADD COLUMN IF NOT EXISTS no_of_positions integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS split_requirement boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_details text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'closed',
  ADD COLUMN IF NOT EXISTS management_status text NOT NULL DEFAULT 'closed',
  ADD COLUMN IF NOT EXISTS management_reason text,
  ADD COLUMN IF NOT EXISTS managed_at text;

-- ========== job_applications ==========
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS requirement_id varchar(255),
  ADD COLUMN IF NOT EXISTS owner_employee_id varchar(255),
  ADD COLUMN IF NOT EXISTS owner_role text,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'job_board',
  ADD COLUMN IF NOT EXISTS last_nudged_at timestamp,
  ADD COLUMN IF NOT EXISTS status_note text,
  ADD COLUMN IF NOT EXISTS withdraw_reason text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS is_candidate_confirmed boolean DEFAULT true;

UPDATE job_applications SET source = 'job_board' WHERE source IS NULL;

-- ========== recruiter_jobs ==========
ALTER TABLE recruiter_jobs
  ADD COLUMN IF NOT EXISTS owner_employee_id varchar(255),
  ADD COLUMN IF NOT EXISTS owner_role text,
  ADD COLUMN IF NOT EXISTS assigned_ta_id varchar(255),
  ADD COLUMN IF NOT EXISTS assigned_ta_name text,
  ADD COLUMN IF NOT EXISTS no_of_positions integer DEFAULT 1;

-- ========== candidates ==========
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS owner_employee_id varchar(255),
  ADD COLUMN IF NOT EXISTS owner_role text,
  ADD COLUMN IF NOT EXISTS registration_stage text NOT NULL DEFAULT 'registered';

-- ========== client org (idempotent) ==========
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

CREATE INDEX IF NOT EXISTS idx_employees_client_company_id
  ON employees (client_company_id);

CREATE INDEX IF NOT EXISTS idx_requirements_assigned_client_member_id
  ON requirements (assigned_client_member_id);

CREATE TABLE IF NOT EXISTS impact_metrics (
  id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  speed_to_hire real NOT NULL DEFAULT 15,
  revenue_impact_of_delay real NOT NULL DEFAULT 75000,
  client_nps real NOT NULL DEFAULT 60,
  candidate_nps real NOT NULL DEFAULT 70,
  feedback_turn_around real NOT NULL DEFAULT 2,
  feedback_turn_around_avg_days real NOT NULL DEFAULT 5,
  first_year_retention_rate real NOT NULL DEFAULT 90,
  fulfillment_rate real NOT NULL DEFAULT 20,
  revenue_recovered real NOT NULL DEFAULT 1.5
);
