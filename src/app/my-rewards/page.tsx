import {
  getRewardsProfile,
  listCreditTransactionsForUser,
  listRedeemedRewards,
} from "@/database/queries/gamification";
import { getCurrentUser } from "@/app/lib/getCurrentUser";

export const dynamic = "force-dynamic";

const CHART_HEIGHT = 220;
const CHART_WIDTH = 980;

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return "Unknown date";
  const date = typeof value === "string" ? new Date(value) : value;
  if (!date || Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const pointsFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const formatPoints = (value: unknown) => {
  const points = Number(value);
  return Number.isFinite(points)
    ? `${pointsFormatter.format(Math.round(points))} pts`
    : null;
};

const formatAmount = (value: unknown) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  const prefix = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${prefix}${Math.abs(Math.round(amount))} pts`;
};

const parseDateInput = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return !date || Number.isNaN(date.getTime()) ? null : date;
};

type CreditTransaction = Awaited<
  ReturnType<typeof listCreditTransactionsForUser>
>[number];

type ChartPoint = {
  date: Date;
  incoming: number;
  outgoing: number;
};

const buildDailySeries = (transactions: CreditTransaction[], days = 14) => {
  const buckets = new Map<
    string,
    { incoming: number; outgoing: number; date: Date }
  >();
  let latestDate: Date | null = null;

  for (const tx of transactions) {
    const parsed = parseDateInput(tx.receivedAt);
    if (!parsed) continue;
    if (!latestDate || parsed > latestDate) latestDate = parsed;
    const key = parsed.toISOString().slice(0, 10);
    const existing = buckets.get(key) ?? {
      incoming: 0,
      outgoing: 0,
      date: parsed,
    };
    const amount = Number(tx.amount ?? 0);
    if (Number.isFinite(amount)) {
      if (amount >= 0) existing.incoming += amount;
      else existing.outgoing += Math.abs(amount);
    }
    existing.date = parsed;
    buckets.set(key, existing);
  }

  const anchor = latestDate ?? new Date();
  const series: ChartPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(anchor);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    series.push({
      date: day,
      incoming: bucket?.incoming ?? 0,
      outgoing: bucket?.outgoing ?? 0,
    });
  }

  return series;
};

const buildLinePath = (values: number[], width: number, height: number) => {
  if (!values.length) return "";
  const maxVal = Math.max(...values, 0);
  const safeMax = maxVal > 0 ? maxVal : 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const hasMovement = maxVal > 0;

  return values
    .map((val, idx) => {
      const ratio = Math.max(0, val) / safeMax;
      const y = hasMovement ? height - ratio * (height - 12) : height / 2;
      const x = idx * stepX;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

const formatShortDate = (value: Date) =>
  value.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default async function RewardsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-[#040815] via-[#050e20] to-[#071531] text-slate-50">
        <section className="w-full px-6 sm:px-10 py-12 flex flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold text-white">My Rewards</h1>
          <p className="text-slate-300">
            Please{" "}
            <a className="underline text-blue-200" href="/login">
              log in
            </a>{" "}
            to view your redeemed rewards.
          </p>
        </section>
      </main>
    );
  }

  const [profile] = await getRewardsProfile(user.id);
  const redeemedRewards = await listRedeemedRewards(user.id);
  const creditTransactions = await listCreditTransactionsForUser(user.id);

  const currentPoints = Number(profile?.currentCredits ?? 0);
  const lifetimePoints = Number(profile?.earnedCredits ?? 0);
  const totalIncoming = creditTransactions.reduce((acc, tx) => {
    const amount = Number(tx.amount ?? 0);
    return acc + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);
  const totalOutgoing = creditTransactions.reduce((acc, tx) => {
    const amount = Number(tx.amount ?? 0);
    return acc + (Number.isFinite(amount) && amount < 0 ? Math.abs(amount) : 0);
  }, 0);
  const netFlow = totalIncoming - totalOutgoing;

  const chartPoints = buildDailySeries(creditTransactions, 14);
  const incomingSeries = chartPoints.map((point) => point.incoming);
  const outgoingSeries = chartPoints.map((point) => point.outgoing);
  const incomingPath = buildLinePath(incomingSeries, CHART_WIDTH, CHART_HEIGHT);
  const outgoingPath = buildLinePath(outgoingSeries, CHART_WIDTH, CHART_HEIGHT);
  const avgIncoming = chartPoints.length
    ? Math.round(
        chartPoints.reduce((sum, point) => sum + point.incoming, 0) /
          chartPoints.length
      )
    : 0;
  const avgOutgoing = chartPoints.length
    ? Math.round(
        chartPoints.reduce((sum, point) => sum + point.outgoing, 0) /
          chartPoints.length
      )
    : 0;
  const displayedTransactions = creditTransactions.slice(0, 50);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#040815] via-[#050e20] to-[#071531] text-slate-50">
      <section className="w-full px-6 sm:px-10 py-12 flex flex-col gap-8 max-w-6xl mx-auto">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Rewards &amp; Activity
          </p>
          <h1 className="text-3xl font-semibold text-white">
            My Rewards &amp; Points
          </h1>
          <p className="text-sm text-slate-300">
            Track your redemptions, see every points movement, and visualize the
            flow of credits hitting your account.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg shadow-blue-500/10">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400 mb-2">
              Current balance
            </p>
            <p className="text-3xl font-semibold text-blue-100">
              {formatPoints(currentPoints) ?? "0 pts"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Spendable points sitting in your wallet.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg shadow-emerald-500/10">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400 mb-2">
              Lifetime earned
            </p>
            <p className="text-3xl font-semibold text-emerald-100">
              {formatPoints(lifetimePoints) ?? "0 pts"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              All points you have accumulated.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg shadow-pink-500/10">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400 mb-2">
              Total spent
            </p>
            <p className="text-3xl font-semibold text-rose-100">
              {formatPoints(totalOutgoing) ?? "0 pts"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Redeemed on rewards, perks, and drops.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg shadow-cyan-500/10">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400 mb-2">
              Net flow
            </p>
            <p
              className={`text-3xl font-semibold ${
                netFlow >= 0 ? "text-cyan-100" : "text-amber-100"
              }`}
            >
              {formatAmount(netFlow)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Incoming minus outgoing across all activity.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur">
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Points timeline
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Inflow vs Outflow (last 14 days)
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-5 rounded-full bg-emerald-400"></span>
                  Incoming
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-5 rounded-full bg-rose-400"></span>
                  Outgoing
                </span>
              </div>
            </div>
            <div className="px-2 sm:px-6 pb-6">
              <div className="relative w-full rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-white/[0.02] p-4 sm:p-6 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_35%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_35%)]" />
                <svg
                  className="relative w-full"
                  viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                  role="img"
                  aria-label="Points inflow and outflow over time"
                >
                  <defs>
                    <linearGradient
                      id="incomingGradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(52,211,153,0.35)" />
                      <stop offset="100%" stopColor="rgba(52,211,153,0)" />
                    </linearGradient>
                    <linearGradient
                      id="outgoingGradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(248,113,113,0.35)" />
                      <stop offset="100%" stopColor="rgba(248,113,113,0)" />
                    </linearGradient>
                  </defs>
                  {[1, 2, 3, 4].map((line) => (
                    <line
                      key={line}
                      x1="0"
                      x2={CHART_WIDTH}
                      y1={(CHART_HEIGHT / 5) * line}
                      y2={(CHART_HEIGHT / 5) * line}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                  {chartPoints.map((point, idx) => (
                    <line
                      key={idx}
                      x1={
                        (CHART_WIDTH / Math.max(chartPoints.length - 1, 1)) *
                        idx
                      }
                      x2={
                        (CHART_WIDTH / Math.max(chartPoints.length - 1, 1)) *
                        idx
                      }
                      y1={0}
                      y2={CHART_HEIGHT}
                      stroke="rgba(255,255,255,0.025)"
                      strokeWidth="1"
                    />
                  ))}
                  {incomingPath ? (
                    <path
                      d={`${incomingPath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`}
                      fill="url(#incomingGradient)"
                      stroke="none"
                    />
                  ) : null}
                  {outgoingPath ? (
                    <path
                      d={`${outgoingPath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`}
                      fill="url(#outgoingGradient)"
                      stroke="none"
                    />
                  ) : null}
                  {incomingPath ? (
                    <path
                      d={incomingPath}
                      fill="none"
                      stroke="rgba(52,211,153,0.9)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                  ) : null}
                  {outgoingPath ? (
                    <path
                      d={outgoingPath}
                      fill="none"
                      stroke="rgba(248,113,113,0.95)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeDasharray="8 4"
                    />
                  ) : null}
                </svg>
                <div className="grid grid-cols-7 gap-2 text-[0.7rem] text-slate-400 mt-3">
                  {chartPoints.map((point, idx) => (
                    <span key={idx} className="text-center truncate">
                      {formatShortDate(point.date)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 text-sm">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Avg incoming
                  </p>
                  <p className="text-lg font-semibold text-emerald-100">
                    {formatPoints(avgIncoming) ?? "0 pts"}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Avg outgoing
                  </p>
                  <p className="text-lg font-semibold text-rose-100">
                    {formatPoints(avgOutgoing) ?? "0 pts"}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Biggest inflow
                  </p>
                  <p className="text-lg font-semibold text-blue-100">
                    {formatPoints(Math.max(...incomingSeries, 0)) ?? "0 pts"}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Biggest spend
                  </p>
                  <p className="text-lg font-semibold text-amber-100">
                    {formatPoints(Math.max(...outgoingSeries, 0)) ?? "0 pts"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur">
            <div className="p-6 border-b border-white/5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Flow snapshot
              </p>
              <h2 className="text-xl font-semibold text-white">Totals</h2>
              <p className="text-sm text-slate-300 mt-1">
                Your points heartbeat, all in one glance.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">Total incoming</p>
                  <p className="text-2xl font-semibold text-emerald-100">
                    {formatPoints(totalIncoming) ?? "0 pts"}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-100 text-xs border border-emerald-400/30">
                  Earned
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">Total outgoing</p>
                  <p className="text-2xl font-semibold text-rose-100">
                    {formatPoints(totalOutgoing) ?? "0 pts"}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-400/10 text-rose-100 text-xs border border-rose-400/30">
                  Redeemed
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">Transactions</p>
                  <p className="text-2xl font-semibold text-white">
                    {creditTransactions.length}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-100 text-xs border border-white/20">
                  Logged
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur">
            <div className="p-6 border-b border-white/5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Rewards
              </p>
              <h2 className="text-xl font-semibold text-white">
                Redeemed Rewards
              </h2>
              <p className="text-sm text-slate-300">
                Latest redemptions appear first.
              </p>
            </div>
            {redeemedRewards.length === 0 ? (
              <div className="p-8 text-center text-slate-200 text-sm">
                You haven&apos;t redeemed any rewards yet.
              </div>
            ) : (
              <ul className="divide-y divide-white/5 max-h-[520px] overflow-auto">
                {redeemedRewards.map((reward) => {
                  const costLabel = formatPoints(reward.totalCost);
                  return (
                    <li
                      key={reward.id}
                      className="p-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg font-semibold text-blue-200">
                            {(reward.item ?? "Reward")
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-white leading-tight">
                              {reward.item ?? "Reward"}
                            </p>
                            {reward.description ? (
                              <p className="text-sm text-slate-300">
                                {reward.description}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-xs text-slate-400">
                          Redeemed {formatDate(reward.redeemedAt)}
                        </div>
                      </div>

                      <div className="sm:text-right sm:self-center space-y-1">
                        {costLabel ? (
                          <p className="text-base font-semibold text-blue-200">
                            {costLabel}
                          </p>
                        ) : null}
                        {reward.rewardId ? (
                          <p className="text-xs text-slate-400">
                            Reward ID: {reward.rewardId}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur">
            <div className="p-6 border-b border-white/5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Transactions
              </p>
              <h2 className="text-xl font-semibold text-white">
                Points Ledger
              </h2>
              <p className="text-sm text-slate-300">
                Latest {displayedTransactions.length} transactions across your
                profile.
              </p>
            </div>
            {displayedTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-200 text-sm">
                No point transactions yet. Earn some points to light this up.
              </div>
            ) : (
              <ul className="divide-y divide-white/5 max-h-[520px] overflow-auto">
                {displayedTransactions.map((tx) => {
                  const amount = Number(tx.amount ?? 0);
                  const isIncoming = amount >= 0;
                  const tone = isIncoming
                    ? "text-emerald-100 bg-emerald-400/10 border-emerald-400/30"
                    : "text-rose-100 bg-rose-400/10 border-rose-400/30";
                  return (
                    <li
                      key={tx.id}
                      className="p-5 flex flex-col gap-2 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${tone}`}
                          >
                            {isIncoming ? "Incoming" : "Outgoing"}
                          </span>
                          <p className="text-base font-semibold text-white">
                            {formatAmount(amount)}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">
                          {formatDate(tx.receivedAt)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>
                          Profile: {tx.profileId?.slice(0, 8) ?? "unknown"}
                        </span>
                        <span className="text-slate-500">
                          Ref: {tx.eventId?.slice(0, 8) ?? "n/a"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
