'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        //Does front end input validation
        const f = firstName.trim();
        const l = lastName.trim();
        const em = email.trim().toLowerCase();
        const sid = studentId.trim();
        const pwd = password;

        if (!f || !l || !em || !sid || !pwd) {
            setError("Please fill in all required fields.");
            return;
        }

        const nameRegex = /^[A-Za-z]{1,32}$/;
        if (!nameRegex.test(f)) {
            setError("First name must be letters only and at most 32 characters.");
            return;
        }
        if (!nameRegex.test(l)) {
            setError("Last name must be letters only and at most 32 characters.");
            return;
        }

        const emailRegex = /^[^\s@]+@torontomu\.ca$/i;
        if (!emailRegex.test(em)) {
            setError("Email must be a torontomu.ca address.");
            return;
        }

        const studentIdRegex = /^[0-9]+$/;
        if (!studentIdRegex.test(sid)) {
            setError("Student ID must contain digits only.");
            return;
        }

        if (pwd.length <= 6) {
            setError("Password must be longer than 6 characters.");
            return;
        }

        //Calls sign up API
        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName: f, lastName: l, email: em, studentId: sid, password: pwd }),
            });
            if (res.ok) {
                router.push("/login");
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data?.error || "Signup failed");
            }
        } catch (e) {
            setError("Network error");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <main className="card w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-blue-500 mb-6">Sign Up</h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="block">
                        <span className="block font-medium mb-2 text-sm">First name</span>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            maxLength={32}
                            pattern="[A-Za-z]{1,32}"
                            title="Letters only, up to 32 characters"
                        />
                    </label>

                    <label className="block">
                        <span className="block font-medium mb-2 text-sm">Last name</span>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            maxLength={32}
                            pattern="[A-Za-z]{1,32}"
                            title="Letters only, up to 32 characters"
                        />
                    </label>

                    <label className="block">
                        <span className="block font-medium mb-2 text-sm">Email</span>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            pattern="^[^\s@]+@torontomu\.ca$"
                            title="Email must end with @torontomu.ca"
                        />
                    </label>

                    <label className="block">
                        <span className="block font-medium mb-2 text-sm">Student ID</span>
                        <input
                            id="studentId"
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            inputMode="numeric"
                            pattern="\d+"
                            title="Digits only"
                        />
                    </label>

                    <label className="block">
                        <span className="block font-medium mb-2 text-sm">Password</span>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            minLength={7}
                            title="Password must be longer than 6 characters"
                        />
                    </label>

                    <button
                        type="submit"
                        className="btn btn-primary mt-2"
                    >
                        Sign Up
                    </button>
                </form>
            </main>
        </div>
    );
}