-- PART 4: Metrics & Requirements Tables (Run after Part 3)
-- =====================================================

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

