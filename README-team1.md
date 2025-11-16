# Team 1

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Next.js](https://nextjs.org)
- [Docker](https://www.docker.com)
- [Migration Tool](https://github.com/golang-migrate/migrate)

# Getting Started on Opening the App

0. Download the Team One artifact, which stores the User authentication and Role Management subproject

1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment variables.Use the sample file as a starting point:
   ```bash
   cp .env.example .env
   ```
3. Start Docker services defined in `docker-compose.yml`:
   ```bash
   docker compose up -d
   ```
4. Launch the app
   ```bash
   npm run dev
5. Open App in browser
   ```
   http://localhost:3000
# Features

# Useful things to know

## Manually connecting to the database
```bash
# Connect to the database inside the container:
docker exec -it cps714_postgres /bin/bash
psql -d campus_connect_db
```

## Database operations
```bash
# List all databases
\list

# Select a database
\c <database>

# List tables in current database
\dt
```

## Database schema
```sql
CREATE TABLE public.users (
    id bigint NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    student_id text NOT NULL,
    password text NOT NULL,
    permission_level smallint DEFAULT 0 NOT NULL
);
```

## Log off Button / User info
``` Javascript
//Adding the logout button can be done so by importing the component/logoutbutton.tsx to your page.

//The authentication and user data are managed by cookies. Read in the cookie data:
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      studentId: string;
      email: string;
      role: Role;
    };

//Roles are organized:
Role {
    TEST = 0,
    STUDENT = 1,
    CLUBLEADER = 2,
    DEPARTMENTADMIN = 3,
    SYSTEMADMIN = 4,
}

Please look at dashboard_test for implementation
```