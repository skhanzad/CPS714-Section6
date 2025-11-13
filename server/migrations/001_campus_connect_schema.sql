-- Drop existing tables if they conflict
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS attachments CASCADE; 
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

-- Create rooms table with UUID
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  features JSONB NOT NULL
);

-- Create resources table with UUID
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- Create bookings table with UUID - FIXED: removed users reference
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

-- Create events table with UUID
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT NOT NULL,
  capacity INTEGER,
  status TEXT NOT NULL CHECK(status IN ('active','canceled')),
  booking_id UUID REFERENCES bookings(id)
);

-- Create attendees table with UUID
CREATE TABLE attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  qr_id TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_attendees_event ON attendees(event_id);

-- Create attachments table with UUID
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('link','file')),
  url TEXT NOT NULL,
  name TEXT,
  mime TEXT
);

CREATE INDEX idx_attachments_event ON attachments(event_id);

-- Insert sample data
INSERT INTO rooms (id, name, capacity, features) VALUES
  (gen_random_uuid(), 'Room 101', 40, '["projector"]'::jsonb),
  (gen_random_uuid(), 'Lecture Hall 202', 120, '["projector","microphone"]'::jsonb),
  (gen_random_uuid(), 'Meeting Room 15', 12, '["whiteboard"]'::jsonb);

INSERT INTO resources (id, name) VALUES
  (gen_random_uuid(), 'Projector'),
  (gen_random_uuid(), 'Microphone'),
  (gen_random_uuid(), 'Catering');