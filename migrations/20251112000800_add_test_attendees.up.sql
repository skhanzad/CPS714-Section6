-- ------------------------------------------------------------
--  ADD TEST USERS AS ATTENDEES TO ALL EVENTS
-- ------------------------------------------------------------

-- Add the 4 test users as attendees to all active events
-- This migration is idempotent - it will only insert if the attendee doesn't already exist for that event
INSERT INTO attendees (id, event_id, name, email, checked_in, qr_id)
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
  'qr-' || REPLACE(REPLACE(u.email, '@', '-'), '.', '-') || '-' || REPLACE(e.id::text, '-', '') AS qr_id
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
    FROM attendees a 
    WHERE a.event_id = e.id 
      AND a.email = u.email
  );

