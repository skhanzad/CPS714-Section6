import { and, eq, gt, gte, sql } from "drizzle-orm";
import { db } from "../connection";
import {
  rewardsTable,
  redeemedRewardsTable,
  creditTransactionsTable,
  rewardsProfilesTable,
  usersTable,
} from "../schema";

// TODO: create profile if not exists
export const getRewardsProfile = async (userId: string) => {
  const profile = await db
    .select()
    .from(rewardsProfilesTable)
    .where(eq(rewardsProfilesTable.userId, userId));

  return profile;
};

export const addCredits = async (
  profileId: string,
  amount: number,
  eventId: string
) => {
  if (amount <= 0) throw new Error("Points must be grater than zero.");
  await db.transaction(async (tx) => {
    await tx.insert(creditTransactionsTable).values({
      profileId,
      amount,
      eventId,
    });

    await tx
      .update(rewardsProfilesTable)
      .set({
        //TODO: add total and update current
        currentCredits: sql`${rewardsProfilesTable.currentCredits} + ${amount}`,
        earnedCredits: sql`${rewardsProfilesTable.earnedCredits} + ${amount}`,
      })
      .where(eq(rewardsProfilesTable.id, profileId));
  });
};

export const redeemReward = async (
  rewardId: string,
  profileId: string,
  quantity: number
) => {
  if (quantity <= 0) {
    return { success: false, error: "invalid_quantity" as const };
  }

  const result = await db.transaction(async (tx) => {
    // check if reward is redeemable
    const [reward] = await tx
      .select()
      .from(rewardsTable)
      .where(eq(rewardsTable.id, rewardId));
    if (!reward || reward.quantity < quantity) {
      return { success: false, error: "unavailable" as const };
    }

    const unitCost = reward.discountCost ?? reward.defaultCost;
    const cost = unitCost * quantity;

    // check if user has enough credits
    const [profile] = await tx
      .select()
      .from(rewardsProfilesTable)
      .where(
        and(
          eq(rewardsProfilesTable.id, profileId),
          gte(rewardsProfilesTable.currentCredits, cost)
        )
      );
    if (!profile) {
      return { success: false, error: "insufficient" as const };
    }

    // reduce inventory amount
    await tx
      .update(rewardsTable)
      .set({
        quantity: sql`${rewardsTable.quantity} - ${quantity}`,
      })
      .where(eq(rewardsTable.id, rewardId));
    // add transaction
    await tx.insert(creditTransactionsTable).values({
      profileId,
      amount: -cost,
    });
    // update current total
    await tx
      .update(rewardsProfilesTable)
      .set({
        currentCredits: sql`${rewardsProfilesTable.currentCredits} - ${cost}`,
      })
      .where(eq(rewardsProfilesTable.id, profileId));

    // record redemption
    await tx.insert(redeemedRewardsTable).values({
      userId: profile.userId,
      rewardId,
      totalCost: cost,
    });

    return { success: true as const };
  });

  return result ?? { success: false, error: "unknown" as const };
};

/**
 * List available rewards (rewards with quantity > 0).
 * Returns reward rows.
 */
export const listAvailableRewards = async () => {
  const availableRewards = await db
    .select()
    .from(rewardsTable)
    .where(gt(rewardsTable.quantity, 0));

  return availableRewards;
};

/**
 * List all rewards (no quantity filter).
 * Returns reward rows ordered by most recently listed.
 */
export const listRewards = async () => {
  const rewards = await db
    .select()
    .from(rewardsTable)
    .orderBy(sql`${rewardsTable.listedAt} DESC`);

  return rewards;
};

type CreateRewardInput = {
  item: string;
  description?: string | null;
  imageUrl?: string | null;
  quantity: number;
  defaultCost: number;
  discountCost?: number | null;
};

export const createReward = async (input: CreateRewardInput) => {
  const payload = {
    item: input.item,
    description: input.description ?? null,
    imageUrl: input.imageUrl ?? null,
    quantity: input.quantity,
    defaultCost: input.defaultCost,
    discountCost: input.discountCost ?? null,
  };

  const [reward] = await db.insert(rewardsTable).values(payload).returning();
  return reward;
};

/**
 * List redeemed rewards (redeemed records) for a given user ID.
 * Returns redeemed reward rows joined with reward details.
 * Args: userID: string
 */
export const listRedeemedRewards = async (userID: string) => {
  const redeemed = await db
    .select({
      id: redeemedRewardsTable.id,
      userId: redeemedRewardsTable.userId,
      rewardId: redeemedRewardsTable.rewardId,
      totalCost: redeemedRewardsTable.totalCost,
      redeemedAt: redeemedRewardsTable.redeemedAt,
      item: rewardsTable.item,
      description: rewardsTable.description,
      imageUrl: rewardsTable.imageUrl,
    })
    .from(redeemedRewardsTable)
    .leftJoin(rewardsTable, eq(redeemedRewardsTable.rewardId, rewardsTable.id))
    .where(eq(redeemedRewardsTable.userId, userID))
    .orderBy(sql`${redeemedRewardsTable.redeemedAt} DESC`);

  return redeemed;
};

/**
 * List leaderboard by top N users.
 * Gets top N users by sum of credit transaction amounts. Returns userId and points.
 * Args: N: number
 */
export const listLeaderboardByN = async (N: number) => {
  const leaderboard = await db
    .select({
      userId: rewardsProfilesTable.userId,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      points: rewardsProfilesTable.earnedCredits,
      currentCredits: rewardsProfilesTable.currentCredits,
    })
    .from(rewardsProfilesTable)
    .leftJoin(usersTable, eq(rewardsProfilesTable.userId, usersTable.id))
    .orderBy(sql`${rewardsProfilesTable.earnedCredits} DESC`)
    .limit(N);

  return leaderboard;
};
