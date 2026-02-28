-- PART 3: Employee & Team Tables (Run after Part 2)
-- =====================================================

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

