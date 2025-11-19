-- ------------------------------------------------------------
--  CREATE AUDIENCE TABLE FOR DEMOGRAPHIC DATA
-- ------------------------------------------------------------

-- Create audience table for college and major demographics
CREATE TABLE IF NOT EXISTS audience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college TEXT NOT NULL,
  major TEXT NOT NULL,
  students INTEGER NOT NULL CHECK (students >= 0)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_audience_college ON audience(college);
CREATE INDEX IF NOT EXISTS idx_audience_major ON audience(major);

-- Ensure pgcrypto extension is available for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert audience data (only if not already exists)
-- Engineering
INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Engineering', 'Computer Science', 85
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Engineering' AND major = 'Computer Science');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Engineering', 'Mechanical Engineering', 65
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Engineering' AND major = 'Mechanical Engineering');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Engineering', 'Electrical Engineering', 40
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Engineering' AND major = 'Electrical Engineering');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Engineering', 'Civil Engineering', 20
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Engineering' AND major = 'Civil Engineering');

-- Business
INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Business', 'Finance', 70
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Business' AND major = 'Finance');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Business', 'Marketing', 50
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Business' AND major = 'Marketing');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Business', 'Accounting', 40
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Business' AND major = 'Accounting');

-- Arts
INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Arts', 'Visual Arts', 35
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Arts' AND major = 'Visual Arts');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Arts', 'Music', 30
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Arts' AND major = 'Music');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Arts', 'Theater', 25
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Arts' AND major = 'Theater');

-- Science
INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Science', 'Biology', 50
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Science' AND major = 'Biology');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Science', 'Chemistry', 40
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Science' AND major = 'Chemistry');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Science', 'Physics', 30
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Science' AND major = 'Physics');

-- Community Studies
INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Community Studies', 'Social Work', 35
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Community Studies' AND major = 'Social Work');

INSERT INTO audience (id, college, major, students)
SELECT gen_random_uuid(), 'Community Studies', 'Education', 35
WHERE NOT EXISTS (SELECT 1 FROM audience WHERE college = 'Community Studies' AND major = 'Education');

