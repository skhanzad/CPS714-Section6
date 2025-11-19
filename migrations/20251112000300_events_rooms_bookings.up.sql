-- ------------------------------------------------------------
--  EVENTS, ROOMS, BOOKINGS, AND RELATED TABLES
-- ------------------------------------------------------------

-- Note: Tables are already created in 20251112000100 with UUID types
-- This migration only creates rooms and resources tables if they don't exist
-- and inserts sample data

-- Create rooms table only if it doesn't exist (checking by trying to create with UUID first)
DO $$
BEGIN
  -- Check if rooms table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rooms') THEN
    CREATE TABLE rooms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      features JSONB NOT NULL
    );
  END IF;
END $$;

-- Create resources table only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'resources') THEN
    CREATE TABLE resources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL
    );
  END IF;
END $$;

-- Create bookings table only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
    CREATE TABLE bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID NOT NULL REFERENCES rooms(id),
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      resources JSONB NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending','approved','denied')),
      requested_by TEXT NOT NULL
    );
    CREATE INDEX idx_bookings_room_time ON bookings(room_id, start_time, end_time);
  END IF;
END $$;

-- ------------------------------------------------------------
--  SAMPLE DATA INSERTS (only if tables use UUID)
-- ------------------------------------------------------------

-- Insert rooms (using UUID)
INSERT INTO rooms (id, name, capacity, features)
SELECT gen_random_uuid(), 'Room 101', 40, '["projector"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Room 101')
ON CONFLICT DO NOTHING;

INSERT INTO rooms (id, name, capacity, features)
SELECT gen_random_uuid(), 'Lecture Hall 202', 120, '["projector","microphone"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Lecture Hall 202')
ON CONFLICT DO NOTHING;

INSERT INTO rooms (id, name, capacity, features)
SELECT gen_random_uuid(), 'Meeting Room 15', 12, '["whiteboard"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Meeting Room 15')
ON CONFLICT DO NOTHING;

-- Insert resources (using UUID)
INSERT INTO resources (id, name)
SELECT gen_random_uuid(), 'Projector'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Projector')
ON CONFLICT DO NOTHING;

INSERT INTO resources (id, name)
SELECT gen_random_uuid(), 'Microphone'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Microphone')
ON CONFLICT DO NOTHING;

INSERT INTO resources (id, name)
SELECT gen_random_uuid(), 'Catering'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Catering')
ON CONFLICT DO NOTHING;
