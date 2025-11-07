CREATE TABLE users (
    id uuid primary key default gen_random_uuid(), -- updated by group 6
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    student_id text NOT NULL,
    password text NOT NULL,
    permission_level smallint DEFAULT 0 NOT NULL
);
