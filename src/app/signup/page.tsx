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
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                    <label>
                        First name
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="border rounded w-full p-2"
                            required
                            maxLength={32}
                            pattern="[A-Za-z]{1,32}"
                            title="Letters only, up to 32 characters"
                        />
                    </label>
                    <br />
                    <label>
                        Last name
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="border rounded w-full p-2"
                            required
                            maxLength={32}
                            pattern="[A-Za-z]{1,32}"
                            title="Letters only, up to 32 characters"
                        />
                    </label>
                    <br />
                    <label>
                        Email
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border rounded w-full p-2"
                            required
                            pattern="^[^\s@]+@torontomu\.ca$"
                            title="Email must end with @torontomu.ca"
                        />
                    </label>
                    <br />
                    <label>
                        Student ID
                        <input
                            id="studentId"
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="border rounded w-full p-2"
                            required
                            inputMode="numeric"
                            pattern="\d+"
                            title="Digits only"
                        />
                    </label>
                    <br />
                    <label>
                        Password
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border rounded w-full p-2"
                            required
                            minLength={7}
                            title="Password must be longer than 6 characters"
                        />
                    </label>
                    <br />
                    {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                        Sign Up
                    </button>
                </form>
            </main>
        </div>
    );
}