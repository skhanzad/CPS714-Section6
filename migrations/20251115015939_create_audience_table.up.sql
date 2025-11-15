-- Table to store audience breakdown data (from audience.csv)
CREATE TABLE audience (
    id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    college  text    NOT NULL,
    major    text    NOT NULL,
    students integer NOT NULL
);
