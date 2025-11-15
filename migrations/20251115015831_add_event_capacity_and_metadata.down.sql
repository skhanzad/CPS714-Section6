-- Roll back event metadata and capacity fields
ALTER TABLE events
    DROP COLUMN IF EXISTS actual_attendance,
    DROP COLUMN IF EXISTS rsvp_count,
    DROP COLUMN IF EXISTS capacity,
    DROP COLUMN IF EXISTS location,
    DROP COLUMN IF EXISTS event_date,
    DROP COLUMN IF EXISTS event_name;
