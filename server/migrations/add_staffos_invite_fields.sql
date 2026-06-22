-- StaffOS onboard invite tracking on pipeline applications
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS staffos_invite_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS staffos_invite_reminder_sent_at TIMESTAMP;

COMMENT ON COLUMN job_applications.staffos_invite_sent_at IS 'When the candidate was invited to complete StaffOS onboarding for this application';
COMMENT ON COLUMN job_applications.staffos_invite_reminder_sent_at IS 'When a reminder invite was sent for StaffOS onboarding';

-- Candidate portal last login (distinct from employees.last_login_at)
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS last_login_at TEXT;

COMMENT ON COLUMN candidates.last_login_at IS 'Last candidate portal login timestamp';
