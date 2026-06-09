CREATE TABLE IF NOT EXISTS incentive_mappings (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_mapping_id varchar NOT NULL,
  candidate_name text,
  team_lead_id varchar NOT NULL,
  team_lead_name text NOT NULL,
  talent_advisor_id varchar NOT NULL,
  talent_advisor_name text NOT NULL,
  quarter text NOT NULL,
  year integer NOT NULL,
  tl_target_amount integer NOT NULL DEFAULT 0,
  ta_target_amount integer NOT NULL DEFAULT 0,
  tl_revenue_amount real NOT NULL DEFAULT 0,
  ta_revenue_amount real NOT NULL DEFAULT 0,
  tl_achieved_amount integer NOT NULL DEFAULT 0,
  ta_achieved_amount integer NOT NULL DEFAULT 0,
  tl_remaining_target integer NOT NULL DEFAULT 0,
  ta_remaining_target integer NOT NULL DEFAULT 0,
  tl_incentive_amount real NOT NULL,
  ta_incentive_amount real NOT NULL,
  bd_incentive_amount real NOT NULL,
  created_at text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS incentive_mappings_revenue_mapping_id_idx
  ON incentive_mappings (revenue_mapping_id);
