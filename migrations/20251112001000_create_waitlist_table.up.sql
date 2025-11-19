-- ------------------------------------------------------------
--  CREATE WAITLIST TABLE
-- ------------------------------------------------------------

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('waitlist', 'confirmed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_event ON waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);

-- Add the 4 users to waitlist for all active events
INSERT INTO waitlist (event_id, email, status)
SELECT 
  e.id,
  u.email,
  'waitlist' AS status
FROM events e
CROSS JOIN (
  VALUES 
    ('Jasdeep2.singh@torontomu.ca'),
    ('arman.grewal@torontomu.ca'),
    ('gurpreet.bhatti@torontomu.ca'),
    ('harnoor.boparai@torontomu.ca')
) AS u(email)
WHERE e.status = 'active'
  AND NOT EXISTS (
    SELECT 1 
    FROM waitlist w 
    WHERE w.event_id = e.id 
      AND w.email = u.email
  );

