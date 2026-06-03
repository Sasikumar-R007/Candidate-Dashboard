ALTER TABLE revenue_mappings
  ADD COLUMN IF NOT EXISTS payment_date text;
