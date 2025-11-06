
'use client'

import { useState } from "react";
import Link from "next/link";
export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logging in with ${email}`);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
       <div>
        <form>
            <label htmlFor="email">Email</label><br/>
            <input id="email" type="text"/><br/>
            <label htmlFor="password">Password</label><br/>
            <input id="password" type="text"></input>
        </form>
       </div>
      </main>
    </div>
  );
}