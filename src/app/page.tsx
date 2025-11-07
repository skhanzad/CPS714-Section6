import { listAvailableRewards } from "@/database/queries/gamification";

export default async function Home() {
  const rewards = await listAvailableRewards();

  return (
    <div>
      {rewards.map((reward) => (
        <div key={reward.id} className="text-white">
          {JSON.stringify(reward)}
        </div>
      ))}
    </div>
  );
}
