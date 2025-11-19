-- ------------------------------------------------------------
--  POPULATE FEEDBACK SUBMISSIONS WITH SAMPLE DATA
-- ------------------------------------------------------------
-- Insert 5 feedback submissions for each event
-- Only inserts if data doesn't already exist (idempotent)

-- Insert feedback submissions only if they don't already exist
-- Using individual INSERT statements with WHERE NOT EXISTS for idempotency

-- Club Fair (5 submissions)
INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Alex Chen', 'Club Fair', 5, 'Great variety of clubs and friendly representatives'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Alex Chen' AND event_name = 'Club Fair' 
    AND comment = 'Great variety of clubs and friendly representatives'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Sarah Johnson', 'Club Fair', 4, 'Found interesting clubs to join this semester'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Sarah Johnson' AND event_name = 'Club Fair' 
    AND comment = 'Found interesting clubs to join this semester'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Michael Park', 'Club Fair', 5, 'Well organized and easy to navigate'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Michael Park' AND event_name = 'Club Fair' 
    AND comment = 'Well organized and easy to navigate'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Emma Williams', 'Club Fair', 3, 'Too crowded but good selection'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Emma Williams' AND event_name = 'Club Fair' 
    AND comment = 'Too crowded but good selection'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'David Kim', 'Club Fair', 5, 'Helped me discover new interests'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'David Kim' AND event_name = 'Club Fair' 
    AND comment = 'Helped me discover new interests'
);

-- Orientation (5 submissions)
INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Rachel Green', 'Orientation', 5, 'Very informative and welcoming'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Rachel Green' AND event_name = 'Orientation' 
    AND comment = 'Very informative and welcoming'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'James Wilson', 'Orientation', 4, 'Good introduction to campus resources'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'James Wilson' AND event_name = 'Orientation' 
    AND comment = 'Good introduction to campus resources'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Sophie Brown', 'Orientation', 5, 'Made me feel comfortable as a new student'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Sophie Brown' AND event_name = 'Orientation' 
    AND comment = 'Made me feel comfortable as a new student'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Ryan Martinez', 'Orientation', 3, 'Too much information in one day'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Ryan Martinez' AND event_name = 'Orientation' 
    AND comment = 'Too much information in one day'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Olivia Davis', 'Orientation', 4, 'Nice campus tour and helpful staff'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Olivia Davis' AND event_name = 'Orientation' 
    AND comment = 'Nice campus tour and helpful staff'
);

-- Sports Day (5 submissions)
INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Nathan Taylor', 'Sports Day', 5, 'Amazing energy and great competition'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Nathan Taylor' AND event_name = 'Sports Day' 
    AND comment = 'Amazing energy and great competition'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Isabella Garcia', 'Sports Day', 4, 'Fun activities and good sportsmanship'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Isabella Garcia' AND event_name = 'Sports Day' 
    AND comment = 'Fun activities and good sportsmanship'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Lucas Anderson', 'Sports Day', 2, 'Weather was not ideal'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Lucas Anderson' AND event_name = 'Sports Day' 
    AND comment = 'Weather was not ideal'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Maya Patel', 'Sports Day', 5, 'Best day of the semester so far'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Maya Patel' AND event_name = 'Sports Day' 
    AND comment = 'Best day of the semester so far'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Ethan Lee', 'Sports Day', 3, 'Enjoyed watching but wish I participated more'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Ethan Lee' AND event_name = 'Sports Day' 
    AND comment = 'Enjoyed watching but wish I participated more'
);

-- Tech Talk (5 submissions)
INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Ava Rodriguez', 'Tech Talk', 5, 'Speaker was excellent and topic was relevant'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Ava Rodriguez' AND event_name = 'Tech Talk' 
    AND comment = 'Speaker was excellent and topic was relevant'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Noah Thompson', 'Tech Talk', 4, 'Learned a lot about industry trends'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Noah Thompson' AND event_name = 'Tech Talk' 
    AND comment = 'Learned a lot about industry trends'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Lily Martinez', 'Tech Talk', 5, 'Great networking opportunity'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Lily Martinez' AND event_name = 'Tech Talk' 
    AND comment = 'Great networking opportunity'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Jacob White', 'Tech Talk', 3, 'Interesting but too technical for beginners'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Jacob White' AND event_name = 'Tech Talk' 
    AND comment = 'Interesting but too technical for beginners'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Chloe Harris', 'Tech Talk', 4, 'Would attend another session like this'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Chloe Harris' AND event_name = 'Tech Talk' 
    AND comment = 'Would attend another session like this'
);

-- Workshop (5 submissions)
INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Daniel Clark', 'Workshop', 5, 'Practical skills that I can use immediately'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Daniel Clark' AND event_name = 'Workshop' 
    AND comment = 'Practical skills that I can use immediately'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Zoe Lewis', 'Workshop', 4, 'Interactive format was engaging'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Zoe Lewis' AND event_name = 'Workshop' 
    AND comment = 'Interactive format was engaging'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Mason Walker', 'Workshop', 3, 'Good content but ran a bit long'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Mason Walker' AND event_name = 'Workshop' 
    AND comment = 'Good content but ran a bit long'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Grace Hall', 'Workshop', 5, 'Best workshop I have attended this year'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Grace Hall' AND event_name = 'Workshop' 
    AND comment = 'Best workshop I have attended this year'
);

INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
SELECT 'Logan Young', 'Workshop', 4, 'Helpful tips and good pace'
WHERE NOT EXISTS (
  SELECT 1 FROM event_feedback_submissions 
  WHERE name = 'Logan Young' AND event_name = 'Workshop' 
    AND comment = 'Helpful tips and good pace'
);

