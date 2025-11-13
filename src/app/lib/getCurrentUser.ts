import { cookies } from "next/headers";
const jwt = require("jsonwebtoken");
import { Role } from "@/auth/User";

const JWT_SECRET = process.env.JWT_SECRET!;

const roleNames: Record<Role, string> = {
  [Role.TEST]: "Test Role",
  [Role.STUDENT]: "Student",
  [Role.CLUBLEADER]: "Club Leader",
  [Role.DEPARTMENTADMIN]: "Department Admin",
  [Role.SYSTEMADMIN]: "System Admin",
};
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