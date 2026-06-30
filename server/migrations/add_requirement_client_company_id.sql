-- Link requirements to Master Data clients.id (nullable for legacy rows).
ALTER TABLE requirements
  ADD COLUMN IF NOT EXISTS client_company_id varchar(255);

CREATE INDEX IF NOT EXISTS idx_requirements_client_company_id
  ON requirements (client_company_id);

-- Backfill from denormalized company name (case-insensitive brand match).
UPDATE requirements r
SET client_company_id = c.id
FROM clients c
WHERE r.client_company_id IS NULL
  AND c.is_login_only IS NOT TRUE
  AND lower(trim(r.company)) = lower(trim(c.brand_name));

-- Rollback (manual): DROP INDEX IF EXISTS idx_requirements_client_company_id;
-- ALTER TABLE requirements DROP COLUMN IF EXISTS client_company_id;
