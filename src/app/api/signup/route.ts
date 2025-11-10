import { NextResponse } from "next/server";
import User from "@/auth/User";

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email, studentId, password } = await req.json();

        //Determines if user already exists with studentId. Each account must have unique studentId
        const existingUser = await User.userexist(studentId);
        if (existingUser) {
            return NextResponse.json({ error: "User with ID already exists" }, { status: 409 });
        }

        //Creates new user
        const newUser = await User.signup(firstName, lastName, email, studentId, password);
        if (newUser === null) {
            return NextResponse.json({ error: "Sign Up failed" }, { status: 400 });
        }
        return NextResponse.json({ user: newUser, message: "Sign Up successful", }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
