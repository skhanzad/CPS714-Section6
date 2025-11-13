import RewardsProfileCard from "@/components/gamification/RewardsProfileCard";
import { TEMP_USER_ID } from "@/components/gamification/constants";
import { addCredits, getRewardsProfile } from "@/database/queries/gamification";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export default async function RewardsPage() {
  async function addDevCredits() {
    "use server";

    const [profile] = await getRewardsProfile(TEMP_USER_ID);
    const profileId = profile?.id;
    if (!profileId) return;

    const randomAmount = Math.floor(Math.random() * 150) + 50;
    const eventId = "9faa273b-d92b-40fb-ad3d-578a0d5f4ea7";

    await addCredits(profileId, randomAmount, eventId);
    revalidatePath("/rewards");
  }

  return (
    <div className="space-y-6 p-6">
      <form action={addDevCredits} className="max-w-sm space-y-2">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Add Random Credits
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dev helper: adds 50-200 credits using temporary IDs.
        </p>
      </form>
      <RewardsProfileCard />
    </div>
  );
}
