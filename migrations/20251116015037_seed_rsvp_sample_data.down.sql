-- Remove sample RSVPs, events, and users inserted by seed_rsvp_sample_data

-- delete RSVPs tied to our sample events OR sample users
DELETE FROM rsvps
WHERE event_id IN (
  SELECT id FROM events
  WHERE event_name IN (
    'Full Hackathon',
    'Interest-Only Info Session',
    'Mixed Status Networking',
    'Tech Expo 2025'
  )
)
OR user_id IN (
  SELECT id FROM users
  WHERE email IN (
    'rsvp.tester1@torontomu.ca',
    'rsvp.tester2@torontomu.ca',
    'rsvp.tester3@torontomu.ca'
  )
);

-- Delete the sample events
DELETE FROM events
WHERE event_name IN (
  'Full Hackathon',
  'Interest-Only Info Session',
  'Mixed Status Networking',
  'Tech Expo 2025'
);

-- Delete the extra sample users
DELETE FROM users
WHERE email IN (
  'rsvp.tester1@torontomu.ca',
  'rsvp.tester2@torontomu.ca',
  'rsvp.tester3@torontomu.ca'
);
