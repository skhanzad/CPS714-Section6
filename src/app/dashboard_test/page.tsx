const jwt = require("jsonwebtoken");
import { cookies } from "next/headers";
import { Role } from "@/auth/User";
import LogoutButton from "../component/logoutbutton";
import { getCurrentUser } from "@/app/lib/getCurrentUser";

const roleColors: Record<Role, string> = {
  [Role.TEST]: "bg-gray-500",
  [Role.STUDENT]: "bg-green-500",
  [Role.CLUBLEADER]: "bg-blue-500",
  [Role.DEPARTMENTADMIN]: "bg-yellow-400",
  [Role.SYSTEMADMIN]: "bg-orange-500",
};

const roleNames: Record<Role, string> = {
  [Role.TEST]: "Test Role",
  [Role.STUDENT]: "Student",
  [Role.CLUBLEADER]: "Club Leader",
  [Role.DEPARTMENTADMIN]: "Department Admin",
  [Role.SYSTEMADMIN]: "System Admin",
};

export default async function DashboardPage() {
  const user = await getCurrentUser(); // await the async function
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-red-600 text-xl">
        No token found. Please <a href="/login" className="underline ml-1">login</a>.
      </div>
    );
  }

  //Decoded role from User.ts
  const role = user.role as Role;
  const bgColor = roleColors[role];
  const roleName = roleNames[role];

  //Returns background colour based on role and logout button
  return (
    <div
      className={`flex h-screen items-center justify-center text-white text-4xl font-bold ${bgColor}`}
    >
      {roleName}
      <LogoutButton />
    </div>
  );
}
