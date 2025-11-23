-- Remove attended_events column from "user" table
ALTER TABLE "users"
DROP COLUMN IF EXISTS attended_events,
DROP COLUMN IF EXISTS interested_events;

ALTER TABLE "events"
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS org,
DROP COLUMN IF EXISTS dateExact,
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS status;
