import { NextResponse } from "next/server";
const jwt = require("jsonwebtoken");
import User from "@/auth/User"; // adjust import path to where your User.ts lives

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { studentId, password } = await req.json();

    const user = await User.login(studentId, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid student ID or password" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user.id,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Optionally set token cookie
    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.getFullName(),
        email: user.email,
        role: user.role,
      },
      token,
    });
    res.cookies.set("token", token, { httpOnly: true, path: "/" });
    return res;
  } catch (err) {
    console.error("Login ", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
