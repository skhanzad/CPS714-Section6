"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Reward = {
  id: string;
  item: string;
  description: string | null;
  quantity: number;
  defaultCost: number;
  discountCost: number | null;
  listedAt: string | null;
};

type Props = {
  rewards: Reward[];
  hasProfile: boolean;
  userEmail: string | null;
  currentPoints: number;
  lifetimePoints: number;
  isAdmin: boolean;
};

const formatPoints = (value: number) => value.toLocaleString();

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return "Unknown date";
  const date = typeof value === "string" ? new Date(value) : value;
  if (!date || Number.isNaN(date.getTime())) return "Unknown date";
  return date.toISOString().slice(0, 10);
};

const getCost = (
  defaultCost: number | null | undefined,
  discountCost: number | null | undefined
) => {
  if (typeof discountCost === "number" && !Number.isNaN(discountCost)) {
    return {
      cost: discountCost,
      isDiscounted: true,
      original: defaultCost ?? discountCost,
    };
  }
  return {
    cost: defaultCost ?? 0,
    isDiscounted: false,
    original: defaultCost ?? 0,
  };
};

type MessageState = { type: "success" | "error"; text: string } | null;

export default function RewardsCatalogClient({
  rewards,
  hasProfile,
  userEmail,
  currentPoints,
  lifetimePoints,
  isAdmin,
}: Props) {
  const [points, setPoints] = useState(currentPoints);
  const [message, setMessage] = useState<MessageState>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    item: "",
    description: "",
    quantity: "1",
    defaultCost: "100",
    discountCost: "",
    imageUrl: "",
  });
  const router = useRouter();

  const rewardsWithCost = useMemo(
    () =>
      rewards.map((reward) => {
        const { cost, isDiscounted, original } = getCost(
          reward.defaultCost,
          reward.discountCost
        );
        const inStock = reward.quantity > 0;
        const canRedeem = hasProfile
          ? inStock && (cost <= 0 || points >= cost)
          : false;
        const remaining = hasProfile ? Math.max(cost - points, 0) : null;
        const showProgress = hasProfile && cost > 0;
        const progressWidth = showProgress
          ? Math.min((points / cost) * 100, 100)
          : null;

        return {
          ...reward,
          cost,
          isDiscounted,
          original,
          inStock,
          canRedeem,
          remaining,
          showProgress,
          progressWidth,
        };
      }),
    [rewards, hasProfile, points]
  );

  const handleRedeem = async (rewardId: string, cost: number, label: string) => {
    if (!hasProfile) {
      setMessage({
        type: "error",
        text: "Log in and ensure you have a rewards profile to redeem.",
      });
      return;
    }
    if (cost > points) {
      setMessage({
        type: "error",
        text: "Not enough points to redeem this reward.",
      });
      return;
    }

    setPendingId(rewardId);
    setMessage(null);

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setMessage({
          type: "error",
          text: data?.error || "Unable to redeem right now.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: `You have successfully redeemed “${label}”.`,
      });
      setPoints((prev) => Math.max(prev - cost, 0));
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Something went wrong while redeeming.",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setCreating(true);

    const payload = {
      item: form.item.trim(),
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      quantity: Number(form.quantity),
      defaultCost: Number(form.defaultCost),
      discountCost:
        form.discountCost.trim() === "" ? null : Number(form.discountCost),
    };

    try {
      const res = await fetch("/api/rewards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setMessage({
          type: "error",
          text: data?.error || "Unable to create reward right now.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Reward listed successfully.",
      });
      setForm({
        item: "",
        description: "",
        quantity: "1",
        defaultCost: "100",
        discountCost: "",
        imageUrl: "",
      });
      setShowCreate(false);
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Something went wrong while creating the reward.",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#040815] via-[#050e20] to-[#071531] text-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Rewards
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold text-white">
                Rewards Catalog
              </h1>
            </div>
            <a
              href="/my-rewards"
              className="text-sm text-blue-200 hover:text-blue-100 underline underline-offset-4"
            >
              View My Redeemed Rewards
            </a>
          </div>
          <p className="text-slate-300 max-w-2xl">
            Redeem points earned from campus events, volunteering, and club
            activity. Track your progress and unlock perks made for TMU
            students.
          </p>
        </header>

        {message ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-100"
                : "border-red-400/50 bg-red-500/10 text-red-100"
            }`}
          >
            <div className="flex flex-col gap-2">
              <span>{message.text}</span>
              {message.type === "success" ? (
                <a
                  href="/my-rewards"
                  className="inline-flex w-fit text-xs text-emerald-100 underline underline-offset-4 hover:text-emerald-50"
                >
                  Go to My Rewards
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {hasProfile ? (
          <section className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-blue-200/80">Your Rewards Profile</p>
                <h2 className="text-2xl font-semibold text-white">
                  Points Overview
                </h2>
                <p className="text-sm text-slate-300">
                  Balances reflect your current rewards profile.
                </p>
              </div>
              {userEmail ? (
                <span className="px-3 py-1 text-xs rounded-full border border-blue-500/40 text-blue-50 bg-blue-900/30">
                  Signed in as <span className="font-semibold">{userEmail}</span>
                </span>
              ) : null}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-600/20 to-indigo-800/10 p-5">
                <p className="text-sm text-blue-100/80">Current Points</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-semibold text-white">
                    {formatPoints(points)}
                  </p>
                  <span className="text-sm text-blue-100/70">available</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-600/15 via-emerald-700/10 to-cyan-800/10 p-5">
                <p className="text-sm text-emerald-100/80">Lifetime Earned</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-semibold text-white">
                    {formatPoints(lifetimePoints)}
                  </p>
                  <span className="text-sm text-emerald-100/70">all-time</span>
                </div>
              </div>
            </div>
          </section>
        ) : userEmail ? (
          <section className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm text-blue-200/80">Your Rewards Profile</p>
                <h2 className="text-2xl font-semibold text-white">
                  No rewards profile found
                </h2>
                <p className="text-sm text-slate-300">
                  We couldn&apos;t find a rewards profile for {userEmail}. Please contact support
                  to set one up.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 flex items-center justify-between gap-3 flex-wrap backdrop-blur">
            <div>
              <p className="text-sm text-blue-200/80">Your Rewards Profile</p>
              <h2 className="text-2xl font-semibold text-white">
                Sign in to track points
              </h2>
              <p className="text-sm text-slate-300">
                Log in to see your current balance and redemption readiness.
              </p>
            </div>
            <a href="/login" className="btn btn-primary">
              Log in
            </a>
          </section>
        )}

        <section className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-sm text-blue-200/80">Catalog</p>
              <h3 className="text-2xl font-semibold text-white">
                Available Rewards
              </h3>
              <p className="text-sm text-slate-300">
                Choose a reward and redeem if you have enough points.
              </p>
            </div>
            {isAdmin ? (
              <button
                className="text-sm text-blue-200 underline underline-offset-4 hover:text-blue-100"
                onClick={() => setShowCreate((prev) => !prev)}
              >
                {showCreate ? "Close listing form" : "List a new reward"}
              </button>
            ) : null}
          </div>

          {isAdmin && showCreate ? (
            <form
              onSubmit={handleCreate}
              className="mb-6 grid gap-4 md:grid-cols-2 bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="md:col-span-2">
                <label className="text-sm text-slate-200 block mb-2">
                  Reward name
                </label>
                <input
                  className="w-full rounded-lg bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white"
                  value={form.item}
                  onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-slate-200 block mb-2">
                  Description (optional)
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-slate-200 block mb-2">Quantity</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-200 block mb-2">
                  Default cost (pts)
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white"
                  value={form.defaultCost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, defaultCost: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-200 block mb-2">
                  Discount cost (pts, optional)
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white"
                  value={form.discountCost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountCost: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm text-slate-200 block mb-2">
                  Image URL (optional)
                </label>
                <input
                  className="w-full rounded-lg bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  className="text-sm text-slate-300 underline underline-offset-4 hover:text-white"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary disabled:opacity-60"
                  disabled={creating}
                >
                  {creating ? "Listing..." : "List reward"}
                </button>
              </div>
            </form>
          ) : null}

          {rewardsWithCost.length === 0 ? (
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200">
              No rewards are listed right now.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rewardsWithCost.map((reward) => (
                <article
                  key={reward.id}
                  className="rounded-xl border border-white/10 bg-[#0d1221]/80 p-5 space-y-4 hover:border-blue-500/50 transition-colors shadow-md shadow-blue-950/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        Listed {formatDate(reward.listedAt)}
                      </p>
                      <h4 className="text-lg font-semibold text-white">
                        {reward.item}
                      </h4>
                      {reward.description ? (
                        <p className="text-sm text-slate-300">
                          {reward.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-1 min-w-[90px] text-right">
                      <span className="text-sm text-blue-100">
                        {reward.cost.toLocaleString()} pts
                      </span>
                      {reward.isDiscounted && reward.original !== reward.cost ? (
                        <span className="text-xs text-slate-400 line-through">
                          {reward.original.toLocaleString()} pts
                        </span>
                      ) : null}
                      <span className="text-xs text-slate-400">
                        {reward.quantity} left
                      </span>
                    </div>
                  </div>

                  {reward.showProgress && reward.progressWidth !== null ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span>
                          {Math.round(reward.progressWidth)}% ({formatPoints(points)} /{" "}
                          {reward.cost.toLocaleString()})
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            reward.canRedeem
                              ? "bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-300"
                              : "bg-gradient-to-r from-blue-600 to-blue-400"
                          }`}
                          style={{ width: `${reward.progressWidth}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      {reward.inStock ? (
                        hasProfile ? (
                          reward.canRedeem ? (
                            <span className="text-emerald-300">Ready to redeem</span>
                          ) : (
                            <>
                              Need{" "}
                              <span className="text-blue-200 font-medium">
                                {reward.remaining ?? 0} pts
                              </span>{" "}
                              more
                            </>
                          )
                        ) : (
                          <span>Log in to check your eligibility.</span>
                        )
                      ) : (
                        <span className="text-red-200">Out of stock</span>
                      )}
                    </div>
                    <button
                      className={`btn w-28 ${
                        reward.canRedeem
                          ? "btn-primary"
                          : "btn-secondary opacity-60 cursor-not-allowed"
                      }`}
                      disabled={!reward.canRedeem || pendingId === reward.id || isPending}
                      onClick={() => handleRedeem(reward.id, reward.cost, reward.item)}
                    >
                      {pendingId === reward.id ? "Redeeming..." : "Redeem"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
