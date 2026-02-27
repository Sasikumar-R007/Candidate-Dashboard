-- =====================================================
-- PRODUCTION DATABASE SETUP - COMPLETE SCHEMA
-- =====================================================
-- Run this in Neon SQL Editor for your production database
-- This creates all tables needed for StaffOS
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

-- Step 3: Create Core Tables
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

-- Step 4: Create Admin User (for login)
-- Password will be hashed by your app, but you need to create one via your app's registration
-- For now, tables are created. You'll need to create admin user through your app interface

-- Step 5: Add missing column to candidates (if needed later)
-- ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_viewed_at TEXT;

-- =====================================================
-- NOTE: This is a simplified version
-- For complete schema, use: npm run db:push
-- =====================================================

