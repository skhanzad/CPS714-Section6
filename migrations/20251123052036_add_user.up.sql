-- Add attended_events UUID array to "user" table
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS attended_events UUID[];
