"use client";

import { useState } from "react";

type Reward = {
  name: string;
  points: number;
  category: string;
  description: string;
};

export default function RewardsPage() {
  const [studentPoints, setStudentPoints] = useState(220);
  const [message, setMessage] = useState("");
  const [redeemedRewards, setRedeemedRewards] = useState<Reward[]>([]);

  const rewards: Reward[] = [
    {
      name: "Free Coffee",
      points: 50,
      category: "Food & Drink",
      description: "One brewed coffee from the campus cafe",
    },
    {
      name: "Study Room Pass",
      points: 150,
      category: "Campus Services",
      description: "Reserve a library study room for 2 hours",
    },
    {
      name: "Event Ticket",
      points: 300,
      category: "Events",
      description: "Admission to a campus concert or workshop",
    },
    {
      name: "Hoodie Discount",
      points: 500,
      category: "Merch",
      description: "$10 off a campus store hoodie",
    },
  ];

  const redeemReward = (reward: Reward) => {
    if (studentPoints < reward.points) {
      setMessage(
        `You need ${reward.points - studentPoints} more points to redeem ${
          reward.name
        }.`
      );
      return;
    }

    setStudentPoints((prev) => prev - reward.points);
    setRedeemedRewards((prev) => [...prev, reward]);
    setMessage(`Successfully redeemed: ${reward.name}.`);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#040815] via-[#050e20] to-[#071531] text-slate-50">
      <section className="w-full px-6 sm:px-10 py-12 flex flex-col gap-8">
        <header className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Rewards Market
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 shadow-lg shadow-blue-950/40">
              <span className="text-sm text-slate-300">Current points</span>
              <span className="text-3xl font-bold text-blue-300">
                {studentPoints}
              </span>
            </div>
            {message && (
              <div className="bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 rounded-xl px-4 py-3 sm:px-6 sm:py-4 max-w-xl shadow-lg shadow-emerald-950/30">
                {message}
              </div>
            )}
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur">
          <table className="w-full border-collapse">
            <thead className="bg-white/5 text-slate-200 uppercase text-xs tracking-wide">
              <tr>
                <th className="p-4 text-left">Reward</th>
                <th className="p-4 text-left">Points</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {rewards.map((reward) => {
                const enoughPoints = studentPoints >= reward.points;
                const progress = Math.min(
                  100,
                  Math.round((studentPoints / reward.points) * 100)
                );

                return (
                  <tr
                    key={reward.name}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 space-y-1 align-top">
                      <div className="font-semibold text-lg text-white">
                        {reward.name}
                      </div>
                      <p className="text-sm text-slate-300">
                        {reward.description}
                      </p>
                    </td>

                    <td className="p-4 align-top">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="text-lg font-semibold text-blue-200">
                          {reward.points}
                        </span>
                        <div className="flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden">
                          <span
                            className="block h-full bg-gradient-to-r from-blue-400 to-emerald-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4 align-top text-right">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md shadow-blue-900/40 hover:bg-blue-500 transition disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                        onClick={() => redeemReward(reward)}
                        disabled={!enoughPoints}
                      >
                        {enoughPoints ? "Redeem" : `Need ${reward.points - studentPoints}`}
                      </button>
                      {!enoughPoints && (
                        <p className="mt-2 text-xs text-amber-200/80">
                          You need {reward.points - studentPoints} more points.
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Redeemed Rewards</h2>
            <span className="text-sm text-slate-300">
              {redeemedRewards.length} item{redeemedRewards.length === 1 ? "" : "s"}
            </span>
          </div>

          {redeemedRewards.length === 0 ? (
            <p className="text-slate-300 text-sm">
              You haven&apos;t redeemed anything yet. Pick a reward to get started.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {redeemedRewards.map((item, index) => (
                <li key={`${item.name}-${index}`} className="py-3 flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-sm text-slate-300">{item.description}</p>
                  </div>
                  <span className="text-sm text-blue-200 font-semibold">
                    -{item.points} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
