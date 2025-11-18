-- ------------------------------------------------------------
--  CREATE FEEDBACK SUBMISSIONS TABLE FOR INDIVIDUAL ENTRIES
-- ------------------------------------------------------------

-- Create table for individual feedback submissions
CREATE TABLE IF NOT EXISTS event_feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_event ON event_feedback_submissions(event_name);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_created ON event_feedback_submissions(created_at);

-- Note: Existing aggregated feedback data will be lost.
-- The feedback table will be recreated as a view that aggregates from individual submissions.

-- Drop the old feedback table (we'll recreate it as a view)
DROP TABLE IF EXISTS feedback CASCADE;

-- Create a view that aggregates feedback submissions for the dashboard
CREATE OR REPLACE VIEW feedback AS
SELECT
  event_name,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating,
  COUNT(*)::integer AS feedback_count,
  STRING_AGG(comment, '; ' ORDER BY created_at) FILTER (WHERE comment IS NOT NULL AND comment != '') AS comments
FROM event_feedback_submissions
GROUP BY event_name;

