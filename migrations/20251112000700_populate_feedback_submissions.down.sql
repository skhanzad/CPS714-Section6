-- ------------------------------------------------------------
--  REMOVE SAMPLE FEEDBACK SUBMISSIONS
-- ------------------------------------------------------------

-- Remove the sample feedback submissions added in this migration
DELETE FROM event_feedback_submissions 
WHERE name IN (
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Williams',
  'James Anderson', 'Maria Garcia', 'Robert Taylor', 'Lisa Brown', 'Christopher Lee',
  'Amanda Martinez', 'Daniel Wilson', 'Nicole Thompson', 'Kevin White', 'Rachel Green',
  'Alex Turner', 'Sophie Mitchell', 'Ryan Cooper', 'Olivia Parker', 'Ethan Davis',
  'Grace Miller', 'Nathan Harris', 'Isabella Clark', 'Matthew Lewis', 'Chloe Walker'
);


