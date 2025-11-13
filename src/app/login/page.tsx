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
      window.location.href = "/leaderboard";
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-500 mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="studentId"
              className="block font-medium mb-2 text-sm"
            >
              Student ID
            </label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              pattern="[0-9]+"
              title="Digits only"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-medium mb-2 text-sm"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              minLength={7}
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
              </div>
            )}

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
          >
            Login
          </button>
        </form>

        <button
          className="btn btn-secondary w-full mt-4"
          onClick={redirectSignup}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
