-- =====================================================
-- PRODUCTION DATABASE SETUP - COMPLETE SCHEMA
-- =====================================================
-- Run this in Neon SQL Editor for your production database
-- This creates ALL tables needed for StaffOS to function properly
-- =====================================================

-- Step 1: Create Session Table (REQUIRED for login to work)
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Step 2: Create Enums
DO $$ BEGIN
  CREATE TYPE meeting_category AS ENUM ('tl', 'ceo_ta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM ('scheduled', 'pending', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE admin_message_status AS ENUM ('active', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create Core User Tables
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
  "current_role" text,
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

-- Step 4: Create Employee & Team Tables
CREATE TABLE IF NOT EXISTS employees (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text,
  role text NOT NULL DEFAULT 'employee_record',
  address text,
  designation text,
  phone text,
  department text,
  joining_date text,
  employment_status text,
  esic text,
  epfo text,
  esic_no text,
  epfo_no text,
  father_name text,
  mother_name text,
  father_number text,
  mother_number text,
  offered_ctc text,
  current_status text,
  increment_count text,
  appraised_quarter text,
  appraised_amount text,
  appraised_year text,
  yearly_ctc text,
  current_monthly_ctc text,
  name_as_per_bank text,
  account_number text,
  ifsc_code text,
  bank_name text,
  branch text,
  city text,
  reporting_to text,
  is_active boolean DEFAULT true,
  created_at text NOT NULL,
  last_login_at text,
  profile_picture text,
  banner_image text
);

CREATE TABLE IF NOT EXISTS team_members (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  salary text NOT NULL,
  year text NOT NULL,
  profiles_count text NOT NULL DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS team_leader_profile (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  employee_id text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  joining_date text NOT NULL,
  department text NOT NULL,
  reporting_to text NOT NULL,
  total_contribution text NOT NULL DEFAULT '2,50,000'
);

-- Step 5: Create Metrics & Target Tables
CREATE TABLE IF NOT EXISTS target_metrics (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  current_quarter text NOT NULL,
  minimum_target text NOT NULL,
  target_achieved text NOT NULL,
  incentive_earned text NOT NULL
);

CREATE TABLE IF NOT EXISTS target_mappings (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  team_lead_id varchar NOT NULL,
  team_member_id varchar NOT NULL,
  quarter text NOT NULL,
  year integer NOT NULL,
  minimum_target integer NOT NULL,
  target_achieved integer DEFAULT 0,
  closures integer DEFAULT 0,
  incentives integer DEFAULT 0,
  created_at timestamp DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_metrics (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  total_requirements text NOT NULL,
  completed_requirements text NOT NULL,
  avg_resumes_per_requirement text NOT NULL,
  requirements_per_recruiter text NOT NULL,
  daily_delivery_delivered text NOT NULL,
  daily_delivery_defaulted text NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_metrics_snapshots (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  scope_type text NOT NULL,
  scope_id varchar,
  scope_name text,
  delivered integer NOT NULL DEFAULT 0,
  defaulted integer NOT NULL DEFAULT 0,
  requirement_count integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  updated_at text
);

CREATE TABLE IF NOT EXISTS impact_metrics (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS revenue_mappings (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_advisor_id varchar NOT NULL,
  talent_advisor_name text NOT NULL,
  team_lead_id varchar NOT NULL,
  team_lead_name text NOT NULL,
  candidate_name text,
  year integer NOT NULL,
  quarter text NOT NULL,
  position text NOT NULL,
  client_id varchar NOT NULL,
  client_name text NOT NULL,
  client_type text NOT NULL,
  partner_name text,
  offered_date text,
  closure_date text,
  percentage real NOT NULL,
  revenue real NOT NULL,
  incentive_plan text NOT NULL,
  incentive real NOT NULL,
  source text NOT NULL,
  invoice_date text,
  invoice_number text,
  received_payment real,
  payment_details text,
  payment_status text,
  incentive_paid_month text,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS cash_outflows (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  year integer NOT NULL,
  employees_count integer NOT NULL,
  total_salary integer NOT NULL,
  incentive integer NOT NULL DEFAULT 0,
  tools_cost integer NOT NULL DEFAULT 0,
  rent integer NOT NULL DEFAULT 0,
  other_expenses integer NOT NULL DEFAULT 0,
  created_at text NOT NULL
);

-- Step 6: Create Meeting & Comment Tables
CREATE TABLE IF NOT EXISTS meetings (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_type text NOT NULL,
  meeting_date text NOT NULL,
  meeting_time text NOT NULL,
  person text NOT NULL,
  person_id varchar,
  agenda text NOT NULL,
  status meeting_status NOT NULL DEFAULT 'pending',
  meeting_category meeting_category NOT NULL,
  notes text,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS ceo_comments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  comment text NOT NULL,
  date text NOT NULL
);

-- Step 7: Create Requirement & Delivery Tables
CREATE TABLE IF NOT EXISTS requirements (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL,
  criticality text NOT NULL,
  toughness text NOT NULL DEFAULT 'Medium',
  company text NOT NULL,
  spoc text NOT NULL,
  talent_advisor text,
  talent_advisor_id varchar,
  team_lead text,
  status text NOT NULL DEFAULT 'open',
  completed_at text,
  is_archived boolean DEFAULT false,
  created_at text NOT NULL,
  jd_file text,
  jd_text text
);

CREATE TABLE IF NOT EXISTS archived_requirements (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL,
  criticality text NOT NULL,
  toughness text NOT NULL DEFAULT 'Medium',
  company text NOT NULL,
  spoc text NOT NULL,
  talent_advisor text,
  team_lead text,
  archived_at text NOT NULL,
  original_id varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS deliveries (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id varchar NOT NULL,
  candidate_name text NOT NULL,
  candidate_email text,
  recruiter_name text NOT NULL,
  delivered_at text NOT NULL,
  status text NOT NULL DEFAULT 'delivered',
  notes text
);

CREATE TABLE IF NOT EXISTS requirement_assignments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id varchar NOT NULL,
  recruiter_id varchar NOT NULL,
  recruiter_name text NOT NULL,
  team_lead_id varchar,
  team_lead_name text,
  assigned_date text NOT NULL,
  due_date text,
  status text NOT NULL DEFAULT 'active',
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS resume_submissions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id varchar NOT NULL,
  assignment_id varchar,
  recruiter_id varchar NOT NULL,
  recruiter_name text NOT NULL,
  candidate_id varchar,
  candidate_name text NOT NULL,
  candidate_email text,
  submitted_at text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  notes text,
  created_at text NOT NULL
);

-- Step 8: Create Candidate Tables
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
  "current_role" text,
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

-- Step 9: Create Interview Tracking Tables
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

-- Step 10: Create Notification Tables
CREATE TABLE IF NOT EXISTS notifications (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  related_job_id text,
  created_at text NOT NULL,
  read_at text
);

CREATE TABLE IF NOT EXISTS user_activities (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Step 11: Create Client Tables
CREATE TABLE IF NOT EXISTS clients (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code text NOT NULL UNIQUE,
  brand_name text NOT NULL,
  incorporated_name text,
  gstin text,
  address text,
  location text,
  spoc text,
  email text,
  website text,
  linkedin text,
  agreement text,
  percentage text,
  category text,
  payment_terms text,
  source text,
  start_date text,
  referral text,
  current_status text DEFAULT 'active',
  is_login_only boolean DEFAULT false,
  created_at text NOT NULL
);

-- Step 12: Create Recruiter Job Tables
CREATE TABLE IF NOT EXISTS recruiter_jobs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id varchar,
  company_name text NOT NULL,
  company_tagline text,
  company_type text,
  company_logo text,
  market text,
  field text,
  no_of_positions integer DEFAULT 1,
  role text NOT NULL,
  experience text NOT NULL,
  location text,
  work_mode text,
  salary_package text,
  about_company text,
  role_definitions text,
  key_responsibility text,
  primary_skills text,
  secondary_skills text,
  knowledge_only text,
  status text NOT NULL DEFAULT 'Active',
  application_count integer DEFAULT 0,
  posted_date timestamp NOT NULL DEFAULT NOW(),
  closed_date timestamp,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS recruiter_commands (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id varchar NOT NULL,
  recruiter_name text NOT NULL,
  command text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_by text NOT NULL,
  date text NOT NULL,
  completed_at text,
  created_at text NOT NULL
);

-- Step 13: Create Bulk Upload Tables
CREATE TABLE IF NOT EXISTS bulk_upload_jobs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id varchar NOT NULL UNIQUE,
  created_by text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_files integer NOT NULL DEFAULT 0,
  processed_files integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  error_message text,
  created_at text NOT NULL,
  updated_at text
);

CREATE TABLE IF NOT EXISTS bulk_upload_files (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id varchar NOT NULL,
  original_name text NOT NULL,
  stored_file_name text NOT NULL,
  path text NOT NULL,
  mime_type text NOT NULL,
  size integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error text,
  parsed_candidate_id text,
  parsed_email text,
  uploaded_at text NOT NULL,
  processed_at text
);

-- Step 14: Create Chat Tables
CREATE TABLE IF NOT EXISTS chat_rooms (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_by text NOT NULL,
  last_message_at text,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_participants (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id varchar NOT NULL,
  participant_id text NOT NULL,
  participant_name text NOT NULL,
  participant_role text NOT NULL,
  joined_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id varchar NOT NULL,
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  message_type text NOT NULL,
  content text NOT NULL,
  created_at text NOT NULL,
  delivered_at text,
  read_at text
);

CREATE TABLE IF NOT EXISTS chat_attachments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id varchar NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_unread_counts (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id varchar NOT NULL,
  participant_id text NOT NULL,
  unread_count integer NOT NULL DEFAULT 0,
  last_read_at text,
  updated_at text NOT NULL
);

-- Step 15: Create Admin Message Tables
CREATE TABLE IF NOT EXISTS admin_messages (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_employee_id text NOT NULL,
  recipient_employee_id text NOT NULL,
  recipient_name text NOT NULL,
  preview text NOT NULL,
  body text NOT NULL,
  status admin_message_status NOT NULL DEFAULT 'active',
  sent_at timestamp NOT NULL DEFAULT NOW()
);

-- Step 16: Create Support Tables
CREATE TABLE IF NOT EXISTS support_conversations (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  user_email text NOT NULL,
  user_name text NOT NULL,
  subject text,
  status text NOT NULL DEFAULT 'open',
  last_message_at text NOT NULL,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS support_messages (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id varchar NOT NULL,
  sender_type text NOT NULL,
  sender_name text NOT NULL,
  message text NOT NULL,
  created_at text NOT NULL
);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- All tables have been created successfully.
-- Your production database is now ready to use.
-- 
-- Next Steps:
-- 1. Verify tables were created: Run "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
-- 2. Create your first admin user through the application interface
-- 3. Configure environment variables in Render backend
-- =====================================================
