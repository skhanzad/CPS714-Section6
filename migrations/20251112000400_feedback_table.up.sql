-- ------------------------------------------------------------
--  CREATE FEEDBACK TABLE FOR ANALYTICS DASHBOARD
-- ------------------------------------------------------------

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  avg_rating NUMERIC(3,1) NOT NULL CHECK (avg_rating >= 1 AND avg_rating <= 5),
  feedback_count INTEGER NOT NULL CHECK (feedback_count >= 0),
  comments TEXT
);

-- Create index on event_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_event_name ON feedback(event_name);

-- Insert feedback data
INSERT INTO feedback (event_name, avg_rating, feedback_count, comments) VALUES
  ('Sports Night', 4.2, 60, 'Well organized activities and smooth event flow; Staff and volunteers were supportive and encouraging; Great way to build community; Fun and energetic atmosphere; Supportive staff'),
  ('Fear Fest', 4.9, 150, 'Spooky atmosphere; Well organized with amazing props and effect; Very thrilling and kept me on edge the whole time; Helped me get into the Halloween spirit;Staff was enthusiatic and made the event more fun'),
  ('Voyage', 3.6, 80, 'Unforgettable views throughout the night; Amazing music; helped meet new people; Well organized event with smooth boarding; Friendly staff and overall relaxing, enjoyable cruise');

