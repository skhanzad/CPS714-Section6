-- Create RSVP table for interest management
CREATE TABLE rsvps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,

    -- RSVP status: RSVP, INTERESTED, WAITLIST
    status varchar(20) NOT NULL CHECK (status IN ('RSVP', 'INTERESTED', 'WAITLIST')),

    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),

    -- Prevent duplicate RSVPs
    CONSTRAINT uq_rsvps_user_event UNIQUE (user_id, event_id)
);
