-- Add event metadata and capacity-related fields
ALTER TABLE events
    ADD COLUMN event_name          text        NOT NULL DEFAULT 'Untitled Event',
    ADD COLUMN event_date          date        NULL,
    ADD COLUMN location            text        NULL,
    ADD COLUMN capacity            integer     NULL,
    ADD COLUMN rsvp_count          integer     NOT NULL DEFAULT 0,
    ADD COLUMN actual_attendance   integer     NOT NULL DEFAULT 0;
