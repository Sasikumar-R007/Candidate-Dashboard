-- Reset impact_metrics demo defaults to zero (run once on existing databases).
UPDATE impact_metrics SET
  speed_to_hire = 0,
  revenue_impact_of_delay = 0,
  client_nps = 0,
  candidate_nps = 0,
  feedback_turn_around = 0,
  feedback_turn_around_avg_days = 0,
  first_year_retention_rate = 0,
  fulfillment_rate = 0,
  revenue_recovered = 0
WHERE
  speed_to_hire = 15
  OR revenue_impact_of_delay = 75000
  OR client_nps = 60
  OR candidate_nps = 70
  OR feedback_turn_around = 2
  OR feedback_turn_around_avg_days = 5
  OR first_year_retention_rate = 90
  OR fulfillment_rate = 20
  OR revenue_recovered = 1.5;

ALTER TABLE impact_metrics ALTER COLUMN speed_to_hire SET DEFAULT 0;
ALTER TABLE impact_metrics ALTER COLUMN revenue_impact_of_delay SET DEFAULT 0;
ALTER TABLE impact_metrics ALTER COLUMN client_nps SET DEFAULT 0;
ALTER TABLE impact_metrics ALTER COLUMN candidate_nps SET DEFAULT 0;
ALTER TABLE impact_metrics ALTER COLUMN feedback_turn_around SET DEFAULT 0;
ALTER TABLE impact_metrics ALTER COLUMN feedback_turn_around_avg_days SET DEFAULT 0;
ALTER TABLE impact_metrics ALTER COLUMN first_year_retention_rate SET DEFAULT 0;
ALTER TABLE impact_metrics ALTER COLUMN fulfillment_rate SET DEFAULT 0;
ALTER TABLE impact_metrics ALTER COLUMN revenue_recovered SET DEFAULT 0;
