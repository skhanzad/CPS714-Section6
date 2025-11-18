-- ------------------------------------------------------------
--  REMOVE ADDITIONAL FEEDBACK ENTRIES
-- ------------------------------------------------------------

-- Remove the feedback entries added in this migration
DELETE FROM feedback WHERE event_name IN ('GDG Hackathon', 'Met Eng', 'Orientation');


