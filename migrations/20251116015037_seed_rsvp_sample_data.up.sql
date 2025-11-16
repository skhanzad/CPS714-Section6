-- Seed sample users, events, and RSVPs for testing

-- 1) Extra test users (only inserted if they don't already exist)
INSERT INTO users (first_name, last_name, email, student_id, password, permission_level)
SELECT 'RSVP', 'Tester1', 'rsvp.tester1@torontomu.ca', '900001', 'password', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rsvp.tester1@torontomu.ca');

INSERT INTO users (first_name, last_name, email, student_id, password, permission_level)
SELECT 'RSVP', 'Tester2', 'rsvp.tester2@torontomu.ca', '900002', 'password', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rsvp.tester2@torontomu.ca');

INSERT INTO users (first_name, last_name, email, student_id, password, permission_level)
SELECT 'RSVP', 'Tester3', 'rsvp.tester3@torontomu.ca', '900003', 'password', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rsvp.tester3@torontomu.ca');

-- Event 1: FULL + WAITLIST
INSERT INTO events (event_name, event_date, location, capacity)
SELECT 'Full Hackathon', DATE '2025-03-10', 'ENG 140', 2
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE event_name = 'Full Hackathon'
);

-- Event 2: INTERESTED only (no RSVPs)
INSERT INTO events (event_name, event_date, location, capacity)
SELECT 'Interest-Only Info Session', DATE '2025-03-12', 'Online (Zoom)', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE event_name = 'Interest-Only Info Session'
);

-- Event 3: Mixed statuses (RSVP + INTERESTED + WAITLIST)
INSERT INTO events (event_name, event_date, location, capacity)
SELECT 'Mixed Status Networking', DATE '2025-03-15', 'SLC Atrium', 3
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE event_name = 'Mixed Status Networking'
);

-- Event 4: Large event with lots of space
INSERT INTO events (event_name, event_date, location, capacity)
SELECT 'Tech Expo 2025', DATE '2025-03-20', 'TRS 1-003', 150
WHERE NOT EXISTS (
  SELECT 1 FROM events WHERE event_name = 'Tech Expo 2025'
);

-- FULL event: 2 RSVPs + 1 WAITLIST
INSERT INTO rsvps (user_id, event_id, status)
SELECT u.id, e.id, 'RSVP'
FROM users u
JOIN events e ON e.event_name = 'Full Hackathon'
WHERE u.email = 'rsvp.tester1@torontomu.ca'
  AND NOT EXISTS (
    SELECT 1 FROM rsvps r
    WHERE r.user_id = u.id AND r.event_id = e.id
  );

INSERT INTO rsvps (user_id, event_id, status)
SELECT u.id, e.id, 'RSVP'
FROM users u
JOIN events e ON e.event_name = 'Full Hackathon'
WHERE u.email = 'rsvp.tester2@torontomu.ca'
  AND NOT EXISTS (
    SELECT 1 FROM rsvps r
    WHERE r.user_id = u.id AND r.event_id = e.id
  );

INSERT INTO rsvps (user_id, event_id, status)
SELECT u.id, e.id, 'WAITLIST'
FROM users u
JOIN events e ON e.event_name = 'Full Hackathon'
WHERE u.email = 'rsvp.tester3@torontomu.ca'
  AND NOT EXISTS (
    SELECT 1 FROM rsvps r
    WHERE r.user_id = u.id AND r.event_id = e.id
  );

-- INTEREST-ONLY event: everyone marked INTERESTED
INSERT INTO rsvps (user_id, event_id, status)
SELECT u.id, e.id, 'INTERESTED'
FROM users u
JOIN events e ON e.event_name = 'Interest-Only Info Session'
WHERE u.email IN (
  'rsvp.tester1@torontomu.ca',
  'rsvp.tester2@torontomu.ca',
  'rsvp.tester3@torontomu.ca'
)
AND NOT EXISTS (
  SELECT 1 FROM rsvps r
  WHERE r.user_id = u.id AND r.event_id = e.id
);

-- Mixed statuses event:
--   tester1: RSVP
--   tester2: INTERESTED
--   tester3: WAITLIST
INSERT INTO rsvps (user_id, event_id, status)
SELECT u.id, e.id, 'RSVP'
FROM users u
JOIN events e ON e.event_name = 'Mixed Status Networking'
WHERE u.email = 'rsvp.tester1@torontomu.ca'
  AND NOT EXISTS (
    SELECT 1 FROM rsvps r
    WHERE r.user_id = u.id AND r.event_id = e.id
  );

INSERT INTO rsvps (user_id, event_id, status)
SELECT u.id, e.id, 'INTERESTED'
FROM users u
JOIN events e ON e.event_name = 'Mixed Status Networking'
WHERE u.email = 'rsvp.tester2@torontomu.ca'
  AND NOT EXISTS (
    SELECT 1 FROM rsvps r
    WHERE r.user_id = u.id AND r.event_id = e.id
  );

INSERT INTO rsvps (user_id, event_id, status)
SELECT u.id, e.id, 'WAITLIST'
FROM users u
JOIN events e ON e.event_name = 'Mixed Status Networking'
WHERE u.email = 'rsvp.tester3@torontomu.ca'
  AND NOT EXISTS (
    SELECT 1 FROM rsvps r
    WHERE r.user_id = u.id AND r.event_id = e.id
  );

-- Tech Expo 2025: just one RSVP so it's clearly "not full"
INSERT INTO rsvps (user_id, event_id, status)
SELECT u.id, e.id, 'RSVP'
FROM users u
JOIN events e ON e.event_name = 'Tech Expo 2025'
WHERE u.email = 'rsvp.tester1@torontomu.ca'
  AND NOT EXISTS (
    SELECT 1 FROM rsvps r
    WHERE r.user_id = u.id AND r.event_id = e.id
  );
