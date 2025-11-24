import { listRedeemedRewards } from "@/database/queries/gamification";
import { getCurrentUser } from "@/app/lib/getCurrentUser";

export const dynamic = "force-dynamic";

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

const formatPoints = (value: unknown) => {
  const points = Number(value);
  return Number.isFinite(points) ? `${points} pts` : null;
};

export default async function MyRewardsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-[#040815] via-[#050e20] to-[#071531] text-slate-50">
        <section className="w-full px-6 sm:px-10 py-12 flex flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold text-white">My Rewards</h1>
          <p className="text-slate-300">
            Please <a className="underline text-blue-200" href="/login">log in</a> to view your redeemed rewards.
          </p>
        </section>
      </main>
    );
  }

  const redeemedRewards = await listRedeemedRewards(user.id);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#040815] via-[#050e20] to-[#071531] text-slate-50">
      <section className="w-full px-6 sm:px-10 py-12 flex flex-col gap-8 max-w-5xl mx-auto">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Rewards
          </p>
          <h1 className="text-3xl font-semibold text-white">Redeemed Rewards</h1>
          <p className="text-sm text-slate-300">
            Showing rewards linked to your account. Latest redemptions appear first.
          </p>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur">
          {redeemedRewards.length === 0 ? (
            <div className="p-8 text-center text-slate-200 text-sm">
              You haven&apos;t redeemed any rewards yet.
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
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
                          {(reward.item ?? "Reward").slice(0, 1).toUpperCase()}
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
      </section>
    </main>
  );
}
