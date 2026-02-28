-- PART 5: Candidates & Interview Tables (Run after Part 4)
-- =====================================================

CREATE TABLE IF NOT EXISTS candidates (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text,
  google_id text UNIQUE,
  phone text,
  company text,
  designation text,
  age text,
  gender text,
  location text,
  experience text,
  skills text,
  profile_picture text,
  banner_image text,
  resume_file text,
  resume_text text,
  education text,
  current_role text,
  portfolio_url text,
  website_url text,
  linkedin_url text,
  pipeline_status text DEFAULT 'New',
  added_by text,
  assigned_to text,
  ctc text,
  ectc text,
  notice_period text,
  position text,
  pedigree_level text,
  company_level text,
  company_sector text,
  product_service text,
  product_category text,
  product_domain text,
  employment_type text,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  created_at text NOT NULL,
  last_viewed_at text
);

CREATE TABLE IF NOT EXISTS candidate_login_attempts (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempts text NOT NULL DEFAULT '0',
  last_attempt_at text,
  locked_until text,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS otps (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp text NOT NULL,
  expires_at text NOT NULL,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS interview_tracker (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name text NOT NULL,
  position text NOT NULL,
  client text NOT NULL,
  interview_date text NOT NULL,
  interview_time text NOT NULL,
  interview_type text NOT NULL,
  interview_round text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  recruiter_name text NOT NULL,
  created_at text NOT NULL,
  updated_at text
);

CREATE TABLE IF NOT EXISTS interview_tracker_counts (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  today_scheduled text NOT NULL DEFAULT '0',
  pending_cases text NOT NULL DEFAULT '0',
  completed_today text NOT NULL DEFAULT '0',
  rescheduled_today text NOT NULL DEFAULT '0',
  cancelled_today text NOT NULL DEFAULT '0',
  recruiter_name text NOT NULL,
  date text NOT NULL,
  updated_at text
);

