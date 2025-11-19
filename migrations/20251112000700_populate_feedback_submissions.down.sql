-- ------------------------------------------------------------
--  REMOVE FEEDBACK SUBMISSIONS SAMPLE DATA
-- ------------------------------------------------------------

DELETE FROM event_feedback_submissions
WHERE name IN (
  'Alex Chen', 'Sarah Johnson', 'Michael Park', 'Emma Williams', 'David Kim',
  'Rachel Green', 'James Wilson', 'Sophie Brown', 'Ryan Martinez', 'Olivia Davis',
  'Nathan Taylor', 'Isabella Garcia', 'Lucas Anderson', 'Maya Patel', 'Ethan Lee',
  'Ava Rodriguez', 'Noah Thompson', 'Lily Martinez', 'Jacob White', 'Chloe Harris',
  'Daniel Clark', 'Zoe Lewis', 'Mason Walker', 'Grace Hall', 'Logan Young'
)
AND event_name IN ('Club Fair', 'Orientation', 'Sports Day', 'Tech Talk', 'Workshop')
AND comment IN (
  'Great variety of clubs and friendly representatives',
  'Found interesting clubs to join this semester',
  'Well organized and easy to navigate',
  'Too crowded but good selection',
  'Helped me discover new interests',
  'Very informative and welcoming',
  'Good introduction to campus resources',
  'Made me feel comfortable as a new student',
  'Too much information in one day',
  'Nice campus tour and helpful staff',
  'Amazing energy and great competition',
  'Fun activities and good sportsmanship',
  'Weather was not ideal',
  'Best day of the semester so far',
  'Enjoyed watching but wish I participated more',
  'Speaker was excellent and topic was relevant',
  'Learned a lot about industry trends',
  'Great networking opportunity',
  'Interesting but too technical for beginners',
  'Would attend another session like this',
  'Practical skills that I can use immediately',
  'Interactive format was engaging',
  'Good content but ran a bit long',
  'Best workshop I have attended this year',
  'Helpful tips and good pace'
);

