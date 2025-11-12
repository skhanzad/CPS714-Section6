-- ------------------------------------------------------------
--  POPULATE SAMPLE EVENT AND ATTENDEE DATA FOR ANALYTICS TEST
-- ------------------------------------------------------------

-- Make sure we can use gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Add the five events
INSERT INTO events (id, title, description, date, start_time, end_time, location, capacity, status)
VALUES
  (gen_random_uuid(), 'Orientation', 'Welcome event for new students', '2025-09-01', '10:00', '12:00', 'Lecture Hall 202', 200, 'active'),
  (gen_random_uuid(), 'Tech Talk', 'CS department guest lecture', '2025-09-15', '14:00', '16:00', 'Room 101', 150, 'active'),
  (gen_random_uuid(), 'Sports Day', 'University-wide sports competition', '2025-10-05', '09:00', '17:00', 'Main Field', 400, 'active'),
  (gen_random_uuid(), 'Workshop', 'Hands-on career skills workshop', '2025-10-12', '13:00', '15:00', 'Meeting Room 15', 100, 'active'),
  (gen_random_uuid(), 'Club Fair', 'All clubs recruiting new members', '2025-09-10', '11:00', '15:00', 'Campus Quad', 500, 'active');

-- 2. Add attendees for each event
-- Each “generate_series” creates that many fake rows.

-- Orientation: 180 RSVPs, 150 checked in
INSERT INTO attendees (id, event_id, name, email, checked_in, qr_id)
SELECT gen_random_uuid(), e.id,
       'Orientation Attendee ' || g,
       'orientation' || g || '@example.com',
       CASE WHEN g <= 150 THEN TRUE ELSE FALSE END,
       'qr-Orientation-' || g
FROM events e, generate_series(1,180) g
WHERE e.title = 'Orientation';

-- Tech Talk: 120 RSVPs, 90 checked in
INSERT INTO attendees (id, event_id, name, email, checked_in, qr_id)
SELECT gen_random_uuid(), e.id,
       'TechTalk Attendee ' || g,
       'techtalk' || g || '@example.com',
       CASE WHEN g <= 90 THEN TRUE ELSE FALSE END,
       'qr-TechTalk-' || g
FROM events e, generate_series(1,120) g
WHERE e.title = 'Tech Talk';

-- Sports Day: 250 RSVPs, 200 checked in
INSERT INTO attendees (id, event_id, name, email, checked_in, qr_id)
SELECT gen_random_uuid(), e.id,
       'SportsDay Attendee ' || g,
       'sportsday' || g || '@example.com',
       CASE WHEN g <= 200 THEN TRUE ELSE FALSE END,
       'qr-SportsDay-' || g
FROM events e, generate_series(1,250) g
WHERE e.title = 'Sports Day';

-- Workshop: 100 RSVPs, 80 checked in
INSERT INTO attendees (id, event_id, name, email, checked_in, qr_id)
SELECT gen_random_uuid(), e.id,
       'Workshop Attendee ' || g,
       'workshop' || g || '@example.com',
       CASE WHEN g <= 80 THEN TRUE ELSE FALSE END,
       'qr-Workshop-' || g
FROM events e, generate_series(1,100) g
WHERE e.title = 'Workshop';

-- Club Fair: 300 RSVPs, 240 checked in
INSERT INTO attendees (id, event_id, name, email, checked_in, qr_id)
SELECT gen_random_uuid(), e.id,
       'ClubFair Attendee ' || g,
       'clubfair' || g || '@example.com',
       CASE WHEN g <= 240 THEN TRUE ELSE FALSE END,
       'qr-ClubFair-' || g
FROM events e, generate_series(1,300) g
WHERE e.title = 'Club Fair';

-- 3. Create a simple view (acts like a table) that Analytics can use
CREATE OR REPLACE VIEW event_summary AS
SELECT
  e.title AS event_name,
  COUNT(a.id) AS rsvp_count,
  COALESCE(SUM(CASE WHEN a.checked_in THEN 1 ELSE 0 END), 0) AS actual_attendance
FROM events e
LEFT JOIN attendees a ON e.id = a.event_id
GROUP BY e.title
ORDER BY e.title;

-- Done! To test, run:
-- SELECT * FROM event_summary;
