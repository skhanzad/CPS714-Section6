-- ------------------------------------------------------------
--  POPULATE SAMPLE FEEDBACK SUBMISSIONS FOR EACH EVENT
-- ------------------------------------------------------------

-- Insert 5 feedback submissions for Club Fair
INSERT INTO event_feedback_submissions (name, event_name, rating, comment) VALUES
  ('Sarah Johnson', 'Club Fair', 5, 'Amazing variety of clubs! Found several I want to join. Great organization and friendly representatives.'),
  ('Michael Chen', 'Club Fair', 4, 'Well organized event with lots of options. Could use more seating areas though.'),
  ('Emily Rodriguez', 'Club Fair', 5, 'Loved the energy and enthusiasm from all the club members. Made it easy to find my interests.'),
  ('David Kim', 'Club Fair', 3, 'Good event but felt a bit crowded. Maybe spread it out over more space next time.'),
  ('Jessica Williams', 'Club Fair', 4, 'Great way to discover new clubs and meet people with similar interests. Very informative!');

-- Insert 5 feedback submissions for Orientation
INSERT INTO event_feedback_submissions (name, event_name, rating, comment) VALUES
  ('James Anderson', 'Orientation', 5, 'Excellent introduction to campus life. The tour guides were very knowledgeable and friendly.'),
  ('Maria Garcia', 'Orientation', 4, 'Helpful information about resources and services. Would have liked more time for questions.'),
  ('Robert Taylor', 'Orientation', 5, 'Made me feel welcome and prepared for the semester ahead. Great first impression!'),
  ('Lisa Brown', 'Orientation', 4, 'Well structured program. The campus tour was particularly helpful in getting oriented.'),
  ('Christopher Lee', 'Orientation', 3, 'Good overall but some sessions felt rushed. More interactive activities would be better.');

-- Insert 5 feedback submissions for Sports Day
INSERT INTO event_feedback_submissions (name, event_name, rating, comment) VALUES
  ('Amanda Martinez', 'Sports Day', 5, 'Incredible day of competition and fun! Great sportsmanship from everyone.'),
  ('Daniel Wilson', 'Sports Day', 4, 'Well organized tournaments. Enjoyed participating in multiple events.'),
  ('Nicole Thompson', 'Sports Day', 5, 'Amazing atmosphere and team spirit. One of the best events of the year!'),
  ('Kevin White', 'Sports Day', 2, 'Some events were delayed and the schedule was confusing at times.'),
  ('Rachel Green', 'Sports Day', 4, 'Fun day overall! Great way to stay active and meet new people.');

-- Insert 5 feedback submissions for Tech Talk
INSERT INTO event_feedback_submissions (name, event_name, rating, comment) VALUES
  ('Alex Turner', 'Tech Talk', 5, 'Fascinating presentation on emerging technologies. The speaker was engaging and knowledgeable.'),
  ('Sophie Mitchell', 'Tech Talk', 4, 'Great insights into the tech industry. Would love to see more hands-on demonstrations.'),
  ('Ryan Cooper', 'Tech Talk', 5, 'Excellent content and very relevant to my studies. Learned a lot about career opportunities.'),
  ('Olivia Parker', 'Tech Talk', 3, 'Interesting topic but the presentation was a bit too technical for beginners.'),
  ('Ethan Davis', 'Tech Talk', 4, 'Good event overall. The Q&A session was particularly valuable.');

-- Insert 5 feedback submissions for Workshop
INSERT INTO event_feedback_submissions (name, event_name, rating, comment) VALUES
  ('Grace Miller', 'Workshop', 5, 'Hands-on learning experience was fantastic! Left with practical skills I can use immediately.'),
  ('Nathan Harris', 'Workshop', 4, 'Well-structured workshop with clear instructions. The materials provided were helpful.'),
  ('Isabella Clark', 'Workshop', 5, 'Excellent facilitator and engaging activities. Highly recommend to others!'),
  ('Matthew Lewis', 'Workshop', 3, 'Good content but felt a bit rushed. Would benefit from more time for practice.'),
  ('Chloe Walker', 'Workshop', 4, 'Practical and informative. Great way to develop new skills in a supportive environment.');


