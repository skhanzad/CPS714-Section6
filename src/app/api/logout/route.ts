import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out successfully" });

  // Clear token cookie
  res.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return res;
}
