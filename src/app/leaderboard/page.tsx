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
const pointsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const formatName = (firstName?: string | null, lastName?: string | null) => {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || "Unknown";
};

const formatPoints = (value: number) =>
  pointsFormatter.format(Math.round(Number.isFinite(value) ? value : 0));

export default async function LeaderboardPage() {
  const leaderboard = await listLeaderboardByN(MAX_ROWS);

  const rows = leaderboard.map((entry, idx) => ({
    rank: idx + 1,
    userId: entry.userId,
    name: formatName(entry.firstName, entry.lastName),
    totalAccumulated: Number(entry.points ?? 0),
    currentCredits: Number(entry.currentCredits ?? 0),
  }));

  const podium = rows.slice(0, 3);
  const podiumStyles = [
    {
      bg: "from-amber-500/25 via-amber-500/10 to-amber-600/5",
      border: "border-amber-200/40",
      shadow: "shadow-amber-500/20",
      badge: "bg-amber-400/20 text-amber-50 border-amber-200/50",
      accent: "text-amber-50",
      label: "🥇",
      heightClass: "md:min-h-[210px]",
      standHeightClass: "h-42 md:h-44",
    },
    {
      bg: "from-slate-200/20 via-slate-200/10 to-slate-100/5",
      border: "border-slate-100/30",
      shadow: "shadow-slate-200/15",
      badge: "bg-slate-200/20 text-slate-900 border-slate-100/40",
      accent: "text-slate-100",
      label: "🥈",
      heightClass: "md:min-h-[190px]",
      standHeightClass: "h-36 md:h-36",
    },
    {
      bg: "from-orange-400/20 via-orange-400/10 to-orange-500/5",
      border: "border-orange-200/35",
      shadow: "shadow-orange-400/15",
      badge: "bg-orange-400/20 text-orange-50 border-orange-200/50",
      accent: "text-orange-50",
      label: "🥉",
      heightClass: "md:min-h-[170px]",
      standHeightClass: "h-28 md:h-28",
    },
  ];
  const podiumOrder = [1, 0, 2].filter((idx) => podium[idx]);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#040815] via-[#050e20] to-[#071531] text-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <header className="space-y-3 flex flex-col items-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Leaderboard
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Points Leaderboard
          </h1>

          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <a
              href="/rewards"
              className="px-4 py-2 rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-100 hover:border-blue-500/60 hover:bg-blue-500/20 transition"
            >
              Rewards Catalog
            </a>
            <a
              href="/my-rewards"
              className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 transition"
            >
              My Rewards / Profile
            </a>
          </div>
        </header>

        {/* Podium */}
        {podium.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end">
            {podiumOrder.map((podiumIndex) => {
              const entry = podium[podiumIndex];
              const style = podiumStyles[podiumIndex] ?? podiumStyles[2];
              return (
                <div
                  key={entry.userId}
                  className={`relative overflow-hidden rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} p-5 shadow-xl ${style.shadow} flex flex-col ${style.heightClass}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)]" />
                  <div className="relative flex h-full flex-col space-y-4">
                    <div className="flex justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20 text-xl">
                        {style.label}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${style.badge}`}
                      >
                        {style.label} Rank #{entry.rank}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-4 py-1 text-xs font-semibold shadow-md">
                        {entry.name}
                      </span>
                    </div>
                    <div
                      className={`relative rounded-xl  border-white/5 bg-white/5 ${style.standHeightClass} overflow-hidden mt-auto`}
                    />
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        {/* Table Container */}
        <section className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 backdrop-blur">
          {rows.length === 0 ? (
            <p className="text-center text-slate-300">
              No leaderboard entries yet.
            </p>
          ) : (
            <Table>
              <TableCaption className="text-slate-400">
                Gamification Leaderboard Rankings
              </TableCaption>

              <TableHeader>
                <TableRow className="border-white/10 text-slate-200">
                  <TableHead className="w-[60px] text-slate-200">
                    Rank
                  </TableHead>
                  <TableHead className="text-slate-200">Name</TableHead>
                  <TableHead className="text-slate-200">Total Points</TableHead>
                  <TableHead className="text-slate-200">
                    Current Balance
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => {
                  const highlight =
                    row.rank === 1
                      ? "bg-amber-500/10 border-amber-200/30"
                      : row.rank === 2
                      ? "bg-slate-200/10 border-slate-100/20"
                      : row.rank === 3
                      ? "bg-orange-500/10 border-orange-200/25"
                      : "";
                  return (
                    <TableRow
                      key={row.userId}
                      className={`border-white/10 hover:bg-white/5 transition ${highlight}`}
                    >
                      <TableCell className="font-medium text-white">
                        {row.rank}
                      </TableCell>
                      <TableCell className="text-slate-200">
                        {row.name}
                      </TableCell>
                      <TableCell className="text-slate-200">
                        {formatPoints(row.totalAccumulated)}
                      </TableCell>
                      <TableCell className="text-slate-200">
                        {formatPoints(row.currentCredits)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </main>
  );
}
