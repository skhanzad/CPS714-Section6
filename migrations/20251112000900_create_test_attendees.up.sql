-- ------------------------------------------------------------
--  CREATE TEST ATTENDEES TABLE FOR EMAIL TESTING
-- ------------------------------------------------------------

-- Create test_attendees table with same structure as attendees
CREATE TABLE IF NOT EXISTS test_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  qr_id TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_test_attendees_event ON test_attendees(event_id);

-- Add the 4 test users as attendees to all active events
INSERT INTO test_attendees (id, event_id, name, email, checked_in, qr_id)
SELECT 
  gen_random_uuid(),
  e.id,
  CASE 
    WHEN u.email = 'sayeed.ahmed@torontomu.ca' THEN 'Sayeed Ahmed'
    WHEN u.email = 'harnoor.boparai@torontomu.ca' THEN 'Harnoor Boparai'
    WHEN u.email = 'woosung.kim@torontomu.ca' THEN 'Woosung Kim'
    WHEN u.email = 'andrew.sudyk@torontomu.ca' THEN 'Andrew Sudyk'
  END AS name,
  u.email,
  FALSE AS checked_in,
  'qr-test-' || REPLACE(REPLACE(u.email, '@', '-'), '.', '-') || '-' || REPLACE(e.id::text, '-', '') AS qr_id
FROM events e
CROSS JOIN (
  VALUES 
    ('sayeed.ahmed@torontomu.ca'),
    ('harnoor.boparai@torontomu.ca'),
    ('woosung.kim@torontomu.ca'),
    ('andrew.sudyk@torontomu.ca')
) AS u(email)
WHERE e.status = 'active'
  AND NOT EXISTS (
    SELECT 1 
    FROM test_attendees ta 
    WHERE ta.event_id = e.id 
      AND ta.email = u.email
  );

