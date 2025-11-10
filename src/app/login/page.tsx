'use client';

import { useState } from "react";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function redirectSignup() {
  window.location.href = "/signup";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    //Does frontend input validation
    const studentIdRegex = /^[0-9]+$/;
      if (!studentIdRegex.test(studentId)) {
          setError("Student ID must contain digits only.");
          return;
      }

      if (password.length <= 6) {
          setError("Password must be longer than 6 characters.");
          return;
      }
    
    //Calls login API
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // redirect to test dashboard
      window.location.href = "/dashboard_test";
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label htmlFor="studentId" className="block font-medium mb-1">Student ID</label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="border rounded w-full p-2"
              pattern="\d+"
              title="Digits only"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded w-full p-2"
              minLength={7}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        <br></br>
        <button className="mt-4 p-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition" onClick={redirectSignup}>Sign Up</button>
      </main>
    </div>
  );
}
