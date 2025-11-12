CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  features JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  resources JSONB NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','approved','denied')),
  requested_by TEXT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);
CREATE INDEX IF NOT EXISTS idx_bookings_room_time
  ON bookings(room_id, start_time, end_time);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT NOT NULL,
  capacity INTEGER,
  status TEXT NOT NULL CHECK(status IN ('active','canceled')),
  booking_id TEXT REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS attendees (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  qr_id TEXT NOT NULL UNIQUE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attendees_event ON attendees(event_id);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('link','file')),
  url TEXT NOT NULL,
  name TEXT,
  mime TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attachments_event ON attachments(event_id);

INSERT INTO rooms (id, name, capacity, features) VALUES
  ('R101','Room 101',40,'["projector"]'::jsonb),
  ('R202','Lecture Hall 202',120,'["projector","microphone"]'::jsonb),
  ('M15','Meeting Room 15',12,'["whiteboard"]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO resources (id, name) VALUES
  ('res-projector','Projector'),
  ('res-microphone','Microphone'),
  ('res-catering','Catering')
ON CONFLICT DO NOTHING;