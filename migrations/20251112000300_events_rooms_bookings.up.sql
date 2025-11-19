-- ------------------------------------------------------------
--  EVENTS, ROOMS, BOOKINGS, AND RELATED TABLES
-- ------------------------------------------------------------
-- NOTE: Tables are already created by migration 20251112000100 with UUID IDs.
-- This migration only ensures indexes exist and inserts sample data if needed.

-- Ensure pgcrypto extension is available for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure indexes exist (may already exist from migration 001)
CREATE INDEX IF NOT EXISTS idx_bookings_room_time
  ON bookings(room_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_attendees_event
  ON attendees(event_id);

CREATE INDEX IF NOT EXISTS idx_attachments_event
  ON attachments(event_id);

-- ------------------------------------------------------------
--  SAMPLE DATA INSERTS (only if data doesn't exist)
-- ------------------------------------------------------------

-- Insert sample rooms only if table is empty or doesn't have these specific rooms
-- Check if rooms table uses UUID (from migration 001) or TEXT schema
DO $$
BEGIN
  -- Check if rooms table exists and what ID type it uses
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    -- UUID schema: insert with UUID IDs only if room names don't exist
    INSERT INTO rooms (id, name, capacity, features)
    SELECT gen_random_uuid(), 'Room 101', 40, '["projector"]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Room 101');
    
    INSERT INTO rooms (id, name, capacity, features)
    SELECT gen_random_uuid(), 'Lecture Hall 202', 120, '["projector","microphone"]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Lecture Hall 202');
    
    INSERT INTO rooms (id, name, capacity, features)
    SELECT gen_random_uuid(), 'Meeting Room 15', 12, '["whiteboard"]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Meeting Room 15');
    
    -- Insert resources with UUID IDs only if names don't exist
    INSERT INTO resources (id, name)
    SELECT gen_random_uuid(), 'Projector'
    WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Projector');
    
    INSERT INTO resources (id, name)
    SELECT gen_random_uuid(), 'Microphone'
    WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Microphone');
    
    INSERT INTO resources (id, name)
    SELECT gen_random_uuid(), 'Catering'
    WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Catering');
    
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'id' AND data_type = 'text'
  ) THEN
    -- TEXT schema: insert with TEXT IDs
    INSERT INTO rooms (id, name, capacity, features)
    VALUES
      ('R101', 'Room 101', 40, '["projector"]'::jsonb),
      ('R202', 'Lecture Hall 202', 120, '["projector","microphone"]'::jsonb),
      ('M15',  'Meeting Room 15', 12, '["whiteboard"]'::jsonb)
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO resources (id, name)
    VALUES
      ('res-projector',  'Projector'),
      ('res-microphone', 'Microphone'),
      ('res-catering',   'Catering')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
