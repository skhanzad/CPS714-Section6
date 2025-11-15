# Team 1 - useful things to know

## Manually connecting to the database
```bash
# connect to the database on the host:
export PGPASSWORD="admin"
psql -U root -h localhost -d campus_connect_db

# or connect to the database inside the container:
docker exec -it cps714_postgres /bin/bash
psql -U root -d campus_connect_db
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

## Dumping and restoring the database
```bash
# install psql tools
sudo apt install postgresql-client-16

# dump the database's contents into an sql file
export PGPASSWORD="admin"
pg_dump -U root -h localhost -p 5432 campus_connect_db > campus_connect_db.sql

# restore the database from an sql file
psql -U root -h localhost -d campus_connect_db -f campus_connect_db.sql
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
```
Adding the logout button can be done so by importing the component/logoutbutton.tsx to your page.

The authentication and user data are managed by cookies. Read in the cookie data:
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      studentId: string;
      email: string;
      role: Role;
    };

Roles are organized:
Role {
    TEST = 0,
    STUDENT = 1,
    CLUBLEADER = 2,
    DEPARTMENTADMIN = 3,
    SYSTEMADMIN = 4,
}

Please look at dashboard_test for implementation
```