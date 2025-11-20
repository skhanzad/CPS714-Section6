"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Hardcoded credentials
  const credentials = {
    student: { email: "student@torontomu.ca", password: "student123" },
    staff: { email: "staff@torontomu.ca", password: "staff123" },
  };

  const handleLogin = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (email === credentials.student.email && password === credentials.student.password) {
      router.push("/events"); // redirect for student
    } else if (email === credentials.staff.email && password === credentials.staff.password) {
      router.push("/staff"); // redirect for staff (example)
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E9E9] flex justify-center items-start">
      <div
        className="bg-white rounded-lg shadow-lg p-7 flex flex-col items-start"
        style={{ width: "550px", height: "750px" }}
      >
        <img
          src="/tmulogo.jpg"
          alt="TMU Logo"
          style={{ width: "197px", height: "120px" }}
          className="mb-10 object-contain"
        />

        <form className="flex flex-col items-center space-y-5 w-full" onSubmit={handleLogin}>
          <div
            className="flex flex-col justify-between p-4 rounded-lg space-y-4"
            style={{ width: "450px", backgroundColor: "#F1F1F1" }}
          >
            <input
              type="email"
              placeholder="yourname@torontomu.ca"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="********"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-start w-full px-6">
            <button
              type="submit"
              className="w-[100px] bg-[#09529D] text-white py-3 rounded-md"
            >
              Log In
            </button>
          </div>
        </form>

        <p className="mt-4 px-6 text-end text-gray-600 text-sm">
          Forgot your password?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Reset
          </a>
        </p>
      </div>
    </div>
  );
}
