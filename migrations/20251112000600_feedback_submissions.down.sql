-- ------------------------------------------------------------
--  DROP FEEDBACK SUBMISSIONS TABLE
-- ------------------------------------------------------------

DROP VIEW IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS event_feedback_submissions CASCADE;

-- Recreate the old feedback table structure (if needed for rollback)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  avg_rating NUMERIC(3,1) NOT NULL CHECK (avg_rating >= 1 AND avg_rating <= 5),
  feedback_count INTEGER NOT NULL CHECK (feedback_count >= 0),
  comments TEXT
);

