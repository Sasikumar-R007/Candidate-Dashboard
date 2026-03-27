ALTER TABLE requirements
ADD COLUMN IF NOT EXISTS no_of_positions integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS split_requirement boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS management_status text NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS management_reason text,
ADD COLUMN IF NOT EXISTS managed_at text;

ALTER TABLE archived_requirements
ADD COLUMN IF NOT EXISTS no_of_positions integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS split_requirement boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'closed',
ADD COLUMN IF NOT EXISTS management_status text NOT NULL DEFAULT 'closed',
ADD COLUMN IF NOT EXISTS management_reason text,
ADD COLUMN IF NOT EXISTS managed_at text;
