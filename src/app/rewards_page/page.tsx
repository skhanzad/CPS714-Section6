"use client";
import React from "react";
import rewardsData from "./rewards.json";
import profileData from "./profile.json";

type Reward = {
  id: number;
  title: string;
  cost: number;
  description: string;
  category: string;
  badge?: string;
};

const rewards: Reward[] = rewardsData;

type Profile = {
  currentPoints: number;
  lifetimePoints: number;
};

export default function RewardsPage() {
  const { currentPoints, lifetimePoints } = profileData as Profile;
  const nearestReward = rewards.find((reward) => reward.cost > currentPoints);
  const pointsToNext = nearestReward ? nearestReward.cost - currentPoints : 0;

  return (
    <main className="w-full">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300/80">
            Rewards
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Rewards Catalog
          </h1>
          <p className="text-zinc-400 max-w-2xl">
            Redeem points earned from campus events, volunteering, and club
            activity. Track your progress and unlock perks made for TMU
            students.
          </p>
        </header>

        <section className="card"> 
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-blue-300/80">Your Rewards Profile</p>
              <h2 className="text-2xl font-semibold text-white">
                Points Overview
              </h2>
              <p className="text-sm text-zinc-400">
                All balances refresh nightly based on campus activity.
              </p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full border border-blue-500/50 text-blue-100 bg-blue-900/30">
              Updated <span className="font-semibold">just now</span>
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#2a2a2f] bg-gradient-to-br from-blue-600/20 to-indigo-800/10 p-5">
              <p className="text-sm text-blue-200/80">Current Points</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-semibold text-white">
                  {currentPoints.toLocaleString()}
                </p>
                <span className="text-sm text-blue-100/70">available</span>
              </div>
              <p className="text-xs text-blue-100/70 mt-1">
                Eligible for immediate redemption.
              </p>
            </div>
            <div className="rounded-xl border border-[#2a2a2f] bg-gradient-to-br from-emerald-600/15 via-emerald-700/10 to-cyan-800/10 p-5">
              <p className="text-sm text-emerald-100/80">Lifetime Earned</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-semibold text-white">
                  {lifetimePoints.toLocaleString()}
                </p>
                <span className="text-sm text-emerald-100/70">all-time</span>
              </div>
              <p className="text-xs text-emerald-100/70 mt-1">
                Total points earned since you joined CampusConnect.
              </p>
            </div>
          </div>

        </section>

        <section className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-sm text-blue-300/80">Catalog</p>
              <h3 className="text-2xl font-semibold text-white">
                Available Rewards
              </h3>
              <p className="text-sm text-zinc-400">
                Choose a reward and redeem instantly if you have enough points.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {rewards.map((reward) => {
              const canRedeem = currentPoints >= reward.cost;
              const progressWidth = Math.min(
                (currentPoints / reward.cost) * 100,
                100
              );

              return (
                <article
                  key={reward.id}
                  className="rounded-xl border border-[#2a2a2f] bg-[#111216]/80 p-5 space-y-4 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                        {reward.category}
                      </p>
                      <h4 className="text-lg font-semibold text-white">
                        {reward.title}
                      </h4>
                      <p className="text-sm text-zinc-300">
                        {reward.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[80px]">
                      {reward.badge && (
                        <span className="px-2 py-1 text-[11px] rounded-full bg-blue-900/50 border border-blue-500/40 text-blue-100">
                          {reward.badge}
                        </span>
                      )}
                      <span className="text-sm text-blue-100">
                        {reward.cost} pts
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Progress</span>
                      <span>
                        {Math.round(progressWidth)}% ({currentPoints} /{" "}
                        {reward.cost})
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          canRedeem
                            ? "bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-300"
                            : "bg-gradient-to-r from-blue-600 to-blue-400"
                        }`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-zinc-400">
                      {canRedeem ? (
                        <span className="text-emerald-300">Ready to redeem</span>
                      ) : (
                        <>
                          Need{" "}
                          <span className="text-blue-200 font-medium">
                            {reward.cost - currentPoints} pts
                          </span>{" "}
                          more
                        </>
                      )}
                    </div>
                    <button
                      className={`btn w-28 ${
                        canRedeem
                          ? "btn-primary"
                          : "btn-secondary opacity-60 cursor-not-allowed"
                      }`}
                      disabled={!canRedeem}
                    >
                      Redeem
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
