-- PART 1: Session Table & Enums (Run this first)
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

