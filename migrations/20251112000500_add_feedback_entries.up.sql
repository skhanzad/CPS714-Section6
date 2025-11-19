-- ------------------------------------------------------------
--  ADD ADDITIONAL FEEDBACK ENTRIES
-- ------------------------------------------------------------

-- This migration runs BEFORE 20251112000600, so feedback should still be a table
-- Insert into feedback table directly
INSERT INTO feedback (event_name, avg_rating, feedback_count, comments)
SELECT 'GDG Hackathon', 3.6, 99, 'Had fun coding; It was very fun; Met Elon Musk; Connected with CS students; Got a ticket to fly to google headquarters'
WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE event_name = 'GDG Hackathon')
ON CONFLICT DO NOTHING;

INSERT INTO feedback (event_name, avg_rating, feedback_count, comments)
SELECT 'Met Eng', 1.0, 5, 'Most awful event ever; They were extremely biased; I didn''t have any fun; There was no food; It was a dead motive'
WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE event_name = 'Met Eng')
ON CONFLICT DO NOTHING;

INSERT INTO feedback (event_name, avg_rating, feedback_count, comments)
SELECT 'Orientation', 4.5, 85, 'A lot of people showed up; The leads were very informative; Events were very interactive; I made a lot of friends; Good amount of food'
WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE event_name = 'Orientation')
ON CONFLICT DO NOTHING;



