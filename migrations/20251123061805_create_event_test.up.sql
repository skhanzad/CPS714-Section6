ALTER TABLE "users"
ADD COLUMN interested_events UUID[];

ALTER TABLE "events"
ADD COLUMN names TEXT NOT NULL,
ADD COLUMN org TEXT NOT NULL,
ADD COLUMN dateExact TEXT NOT NULL,
ADD COLUMN locations TEXT NOT NULL,
ADD COLUMN currStatus TEXT NOT NULL;


INSERT INTO events (names, org, dateExact, locations, currStatus) VALUES
('Bug Push', 'MUESS', '2025/10/08 • 06:00 PM', 'KHW', 'done'),
('Resume Roast', 'TMU CSCU', '2025/10/08 • 08:00 PM', 'DCC-208', 'done'),
('Hackathon', 'TMU Tech Club', '2025/11/15 • 09:00 AM', 'DCC-101', 'upcoming'),
('Career Fair', 'TMU CSCU', '2025/12/01 • 10:00 AM', 'Main Hall', 'upcoming'),
('Networking Night', 'MUESS', '2025/11/20 • 07:00 PM', 'KHW', 'upcoming');