INSERT INTO users 
(first_name, last_name, email, student_id, password, permission_level, attended_events, interested_events, points)
VALUES
(
    'Jimmy',
    'Fang',
    'jimmy.fangxu@example.com',
    'S1234567',
    'password123',
    0,
    ARRAY['00000001-0000-0000-0000-000000000001']::uuid[], -- ID for bug push event, attended this event.
    ARRAY['00000003-0000-0000-0000-000000000003']::uuid[], -- Interested in the Hackathon
    5000
);