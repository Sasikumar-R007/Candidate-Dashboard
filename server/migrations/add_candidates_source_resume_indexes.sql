-- Speeds up Source Resume browse (active candidates, newest first) and count queries.
CREATE INDEX IF NOT EXISTS idx_candidates_active_created_at
  ON candidates (is_active, created_at DESC);
