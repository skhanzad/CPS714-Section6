import { NextResponse } from "next/server";
import User from "@/auth/User";

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email, studentId, password } = await req.json();
        
        const existingUser = await User.login(studentId, password);
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

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
