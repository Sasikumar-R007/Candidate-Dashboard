ALTER TABLE recruiter_jobs
  ADD COLUMN IF NOT EXISTS owner_employee_id varchar,
  ADD COLUMN IF NOT EXISTS owner_role text;

UPDATE recruiter_jobs
SET owner_employee_id = recruiter_id,
    owner_role = COALESCE(owner_role, 'recruiter')
WHERE owner_employee_id IS NULL
  AND recruiter_id IS NOT NULL;

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS owner_employee_id varchar,
  ADD COLUMN IF NOT EXISTS owner_role text;

ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS owner_employee_id varchar,
  ADD COLUMN IF NOT EXISTS owner_role text;
