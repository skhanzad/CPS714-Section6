-- Remove attended_events column from "user" table
ALTER TABLE "users"
DROP COLUMN IF EXISTS interested_events,
DROP COLUMN IF EXISTS points;

ALTER TABLE "events"
DROP COLUMN IF EXISTS names,
DROP COLUMN IF EXISTS org,
DROP COLUMN IF EXISTS dateExact,
DROP COLUMN IF EXISTS locations,
DROP COLUMN IF EXISTS currStatus;

DELETE FROM events;