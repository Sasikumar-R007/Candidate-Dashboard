-- PART 2: Core User Tables (Run after Part 1)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  title text NOT NULL,
  location text NOT NULL,
  education text,
  portfolio text,
  mobile text,
  whatsapp text,
  primary_email text,
  secondary_email text,
  current_location text,
  preferred_location text,
  date_of_birth text,
  gender text,
  portfolio_url text,
  website_url text,
  linkedin_url text,
  profile_picture text,
  banner_image text,
  resume_file text,
  resume_text text,
  applied_jobs_count text DEFAULT '0',
  highest_qualification text,
  college_name text,
  skills text,
  pedigree_level text,
  notice_period text,
  current_company text,
  current_role text,
  current_domain text,
  company_level text,
  product_service text
);

CREATE TABLE IF NOT EXISTS job_preferences (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id varchar NOT NULL,
  job_titles text NOT NULL,
  work_mode text NOT NULL,
  employment_type text NOT NULL,
  locations text NOT NULL,
  start_date text NOT NULL,
  instructions text
);

CREATE TABLE IF NOT EXISTS skills (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id varchar NOT NULL,
  name text NOT NULL,
  category text NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id varchar NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  date text NOT NULL
);

CREATE TABLE IF NOT EXISTS job_applications (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id varchar NOT NULL,
  recruiter_job_id varchar,
  requirement_id varchar,
  job_title text NOT NULL,
  company text NOT NULL,
  job_type text,
  status text NOT NULL DEFAULT 'In Process',
  source text NOT NULL DEFAULT 'job_board',
  applied_date timestamp NOT NULL DEFAULT NOW(),
  candidate_name text,
  candidate_email text,
  candidate_phone text,
  description text,
  salary text,
  location text,
  work_mode text,
  experience text,
  skills text,
  logo text
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id varchar NOT NULL,
  job_title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  salary text,
  job_type text NOT NULL,
  saved_date text NOT NULL
);

