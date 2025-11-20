"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = {
  rank: number;
  userId: string;
  name: string;
  totalAccumulated: number;
  currentCredits: number;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setRows(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start p-8 text-white"
      style={{
        backgroundColor: "rgba(21, 25, 33)", // page background
      }}
    >
      <div className="w-full max-w-4xl flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-6">Leaderboard</h1>

        {/* Buttons */}
        <div className="flex gap-3 mb-10">
          <a
            href="/dashboard_test"
            className="px-4 py-2 border rounded hover:bg-gray-700 transition"
          >
            Dashboard
          </a>

          <button
            onClick={() =>
              fetch("/api/test/add-points", { method: "POST" }).then(() =>
                location.reload()
              )
            }
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            +100 All
          </button>

          <button
            onClick={() =>
              fetch("/api/test/remove-points", { method: "POST" }).then(() =>
                location.reload()
              )
            }
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition"
          >
            -100 All
          </button>

          <button
            onClick={() =>
              fetch("/api/test/reset-points", { method: "POST" }).then(() =>
                location.reload()
              )
            }
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Reset All
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div
        className="w-full max-w-4xl rounded-lg shadow-lg p-6"
        style={{ backgroundColor: "rgba(29, 50, 77)" }} // table bg
      >
        {loading ? (
          <p className="text-center text-white">Loading leaderboard...</p>
        ) : (
          <Table>
            <TableCaption className="text-gray-300">
              Gamification Leaderboard Rankings
            </TableCaption>

            <TableHeader>
              <TableRow className="text-white border-gray-500">
                <TableHead className="w-[60px] text-white">Rank</TableHead>
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Total Points</TableHead>
                <TableHead className="text-white">Current Balance</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.userId} className="border-gray-600">
                  <TableCell className="font-medium text-white">
                    {row.rank}
                  </TableCell>
                  <TableCell className="text-white">{row.name}</TableCell>
                  <TableCell className="text-white">
                    {row.totalAccumulated}
                  </TableCell>
                  <TableCell className="text-white">
                    {row.currentCredits}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  );
}
