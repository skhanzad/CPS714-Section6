const jwt = require("jsonwebtoken");
import { cookies } from "next/headers";
import { Role } from "@/auth/User";
import AdminPanel from "@/components/admin/AdminPanel";

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
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-red-600 text-xl">
        No token found. Please{" "}
        <a href="/login" className="underline ml-1">
          login
        </a>
        .
      </div>
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      studentId: string;
      email: string;
      role: Role;
    };

    const role = decoded.role as Role;
    const bgColor = roleColors[role];
    const roleName = roleNames[role];

    // Show admin panel to DEPARTMENTADMIN and SYSTEMADMIN
    const isAdmin = role === Role.DEPARTMENTADMIN || role === Role.SYSTEMADMIN;

    return (
      <div className={`min-h-screen p-6 ${bgColor} text-white`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{roleName}</h1>
          {isAdmin ? (
            <AdminPanel />
          ) : (
            <div className="text-xl">Welcome, {decoded.email}</div>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error("Invalid JWT:", err);
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-red-600 text-xl">
        Invalid or expired token. Please{" "}
        <a href="/login" className="underline ml-1">
          login again
        </a>
        .
      </div>
    );
  }
}
