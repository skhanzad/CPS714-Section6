import { getCurrentUser } from "@/app/lib/getCurrentUser";
import { Role } from "@/auth/User";
import {
  getRewardsProfile,
  listRewards,
} from "@/database/queries/gamification";
import RewardsCatalogClient from "./RewardsCatalogClient";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  const [profile] = user ? await getRewardsProfile(user.id) : [];
  const hasProfile = Boolean(profile);
  const isAdmin =
    user &&
    (user.role === Role.DEPARTMENTADMIN || user.role === Role.SYSTEMADMIN);

  const currentPoints = hasProfile ? Number(profile?.currentCredits ?? 0) : 0;
  const lifetimePoints = hasProfile ? Number(profile?.earnedCredits ?? 0) : 0;

  const rewards = (await listRewards()).map((reward) => {
    const listedAtValue = reward.listedAt;
    const listedAt =
      listedAtValue instanceof Date
        ? listedAtValue.toISOString()
        : listedAtValue
        ? new Date(listedAtValue as unknown as string).toISOString()
        : null;

    return { ...reward, listedAt };
  });

  return (
    <RewardsCatalogClient
      rewards={rewards}
      hasProfile={hasProfile}
      userEmail={user?.email ?? null}
      currentPoints={currentPoints}
      lifetimePoints={lifetimePoints}
      isAdmin={Boolean(isAdmin)}
    />
  );
}
