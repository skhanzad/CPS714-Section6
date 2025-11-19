-- Remove rewards system
DROP TABLE IF EXISTS reward_tracker CASCADE;
ALTER TABLE events DROP COLUMN IF EXISTS points;

