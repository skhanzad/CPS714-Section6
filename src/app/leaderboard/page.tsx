import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listLeaderboardByN } from "@/database/queries/gamification";

export const dynamic = "force-dynamic";

const MAX_ROWS = 200;

const formatName = (firstName?: string | null, lastName?: string | null) => {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || "Unknown";
};

export default async function LeaderboardPage() {
  const leaderboard = await listLeaderboardByN(MAX_ROWS);

  const rows = leaderboard.map((entry, idx) => ({
    rank: idx + 1,
    userId: entry.userId,
    name: formatName(entry.firstName, entry.lastName),
    totalAccumulated: Number(entry.points ?? 0),
    currentCredits: Number(entry.currentCredits ?? 0),
  }));

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
        <div className="flex gap-3 mb-10 flex-wrap">
          <a
            href="/dashboard_test"
            className="px-4 py-2 border rounded hover:bg-gray-700 transition"
          >
            Dashboard
          </a>

          <form action="/api/test/add-points" method="post">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition w-full"
            >
              +100 All
            </button>
          </form>

          <form action="/api/test/remove-points" method="post">
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition w-full"
            >
              -100 All
            </button>
          </form>

          <form action="/api/test/reset-points" method="post">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition w-full"
            >
              Reset All
            </button>
          </form>

          <a
            href="/login"
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Logout
          </a>
        </div>
      </div>

      {/* Table Container */}
      <div
        className="w-full max-w-4xl rounded-lg shadow-lg p-6"
        style={{ backgroundColor: "rgba(29, 50, 77)" }} // table bg
      >
        {rows.length === 0 ? (
          <p className="text-center text-white">No leaderboard entries yet.</p>
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
