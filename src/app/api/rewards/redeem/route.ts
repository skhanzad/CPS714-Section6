import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/getCurrentUser";
import { getRewardsProfile, redeemReward } from "@/database/queries/gamification";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { rewardId, quantity = 1 } = await req.json();
    if (!rewardId || typeof rewardId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing rewardId" },
        { status: 400 }
      );
    }
    const normalizedQuantity = Number(quantity);
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
      return NextResponse.json(
        { ok: false, error: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    const [profile] = await getRewardsProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "Rewards profile not found" },
        { status: 404 }
      );
    }

    const result = await redeemReward(rewardId, profile.id, normalizedQuantity);
    if (!result.success) {
      const errorMap: Record<string, { message: string; status: number }> = {
        unavailable: { message: "Reward unavailable", status: 400 },
        insufficient: { message: "Not enough points", status: 400 },
        invalid_quantity: { message: "Invalid quantity", status: 400 },
        unknown: { message: "Unable to redeem reward", status: 500 },
      };
      const mapped = errorMap[result.error ?? "unknown"];
      return NextResponse.json(
        { ok: false, error: mapped.message },
        { status: mapped.status }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Reward redeemed successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Redeem error", err);
    return NextResponse.json(
      { ok: false, error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}
