"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="card text-center">
      <h1 className="text-3xl font-bold text-[#1E90FF] mb-3">CampusConnect</h1>
      <p className="text-sm text-zinc-400 mb-8">
        A centralized web platform for managing and promoting all TMU campus events
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/login" className="btn btn-primary">Login</Link>
        <Link href="/signup" className="btn btn-secondary">Sign Up</Link>
      </div>
    </div>
  );
}
