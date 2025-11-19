-- ------------------------------------------------------------
--  ADD REWARDS SYSTEM: POINTS TO EVENTS AND REWARD_TRACKER TABLE
-- ------------------------------------------------------------

-- Add points column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Assign random points to existing events
UPDATE events SET points = 100 WHERE title = 'Orientation';
UPDATE events SET points = 200 WHERE title = 'Tech Talk';
UPDATE events SET points = 150 WHERE title = 'Sports Day';
UPDATE events SET points = 250 WHERE title = 'Workshop';
UPDATE events SET points = 175 WHERE title = 'Club Fair';

-- Create reward_tracker table
CREATE TABLE IF NOT EXISTS reward_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  current_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reward_tracker_email ON reward_tracker(user_email);

-- Populate reward_tracker with 4 users (initial points 0)
INSERT INTO reward_tracker (user_email, current_points)
VALUES
  ('sayeed.ahmed@torontomu.ca', 0),
  ('harnoor.boparai@torontomu.ca', 0),
  ('woosung.kim@torontomu.ca', 0),
  ('andrew.sudyk@torontomu.ca', 0)
ON CONFLICT (user_email) DO NOTHING;

