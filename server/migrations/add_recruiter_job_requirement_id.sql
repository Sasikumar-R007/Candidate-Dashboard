ALTER TABLE recruiter_jobs
  ADD COLUMN IF NOT EXISTS requirement_id varchar;

CREATE INDEX IF NOT EXISTS idx_recruiter_jobs_requirement_id
  ON recruiter_jobs (requirement_id);
