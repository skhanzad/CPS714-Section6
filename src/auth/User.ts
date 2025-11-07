import getDb from "./db";

/*
CREATE TABLE public.users (
    id bigint NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    student_id text NOT NULL,
    password text NOT NULL,
    role smallint DEFAULT 0 NOT NULL
);
*/

export enum Role {
    STUDENT = 1,
    CLUBLEADER = 2,
    DEPARTMENTADMIN = 3,
    SYSTEMADMIN = 4,
}

export default class User {
    static async login(studentId: string, password: string): Promise<User | null> {
        const db = await getDb();
        const res = await db.query(
            "SELECT * FROM users WHERE student_id = $1 AND password = $2",
            [studentId, password]
        );
        if (res.rows.length === 0) {
            return null;
        }
        const row = res.rows[0];
        return new User(row.id, row.first_name, row.last_name, row.email, row.student_id, row.role);
    }

    static async signup(firstName: string, lastName: string, email: string, studentId: string, password: string): Promise<User | null> {
        const db = await getDb();
        const res = await db.query(
            "INSERT INTO users (first_name, last_name, email, student_id, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [firstName, lastName, email, studentId, password, Role.STUDENT]
        );
        if (res.rows.length === 0) {
            return null;
        }
        const row = res.rows[0];
        return new User(row.id, row.first_name, row.last_name, row.email, row.student_id, row.role);
    }

    id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
    role: Role;
    constructor(id: string, firstName: string, lastName: string, email: string, studentId: string, role: Role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.studentId = studentId;
        this.role = role;
    }

    getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    isStudent(): boolean {
        return this.role === Role.STUDENT;
    }

    isClubLeader(): boolean {
        return this.role === Role.CLUBLEADER;
    }

    isDepartmentAdmin(): boolean {
        return this.role === Role.DEPARTMENTADMIN;
    }

    isSystemAdmin(): boolean {
        return this.role === Role.SYSTEMADMIN;
    }
}
