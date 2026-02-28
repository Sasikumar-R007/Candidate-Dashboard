-- PART 6: Final Tables - Notifications, Clients, Chat, etc. (Run after Part 5)
-- =====================================================

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

