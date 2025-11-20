import { cookies } from "next/headers";
const jwt = require("jsonwebtoken");
import { Role } from "@/auth/User";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null; //No Token available

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      studentId: string;
      email: string;
      role: Role;
    };
    return decoded;
  } catch {
    return null;
  }
}