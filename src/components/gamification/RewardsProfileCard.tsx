import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { TEMP_USER_ID } from "./constants";
import { getRewardsProfile } from "@/database/queries/gamification";

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

export default async function RewardsProfileCard() {
  const [profile] = await getRewardsProfile(TEMP_USER_ID);
  const totalCredits = profile?.currentCredits ?? 0;
  const totalEarned = profile?.earnedCredits ?? 0;

  return (
    <div className="flex justify-center items-center h-screen">
      <HoverCard className="w-full max-w-sm">
        <HoverCardTrigger className="w-full">
          <Card className="w-full cursor-pointer border-blue-100  from-white via-white to-blue-50 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <CardHeader className="border-none pb-4">
              <CardDescription className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Rewards Balance
              </CardDescription>
              <CardTitle className="text-4xl font-semibold text-blue-600 dark:text-blue-400">
                {formatCredits(totalCredits)} pts
              </CardTitle>
            </CardHeader>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 text-sm leading-relaxed">
          <div>
            <p className="tracking-[0.2em]">Total Credits Earned:</p>
            <p className="mt-1 font-mono text-slate-900 dark:text-blue-400">
              {formatCredits(totalEarned)} pts
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
