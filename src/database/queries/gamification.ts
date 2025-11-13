import { and, eq, gt, gte, sql } from "drizzle-orm";
import { db } from "../connection";
import {
  rewardsTable,
  redeemedRewardsTable,
  creditTransactionsTable,
  rewardsProfilesTable,
  usersTable,
} from "../schema";

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
  const isRedeemed = await db.transaction(async (tx) => {
    // check if reward is redeemable
    const [reward] = await tx
      .select()
      .from(rewardsTable)
      .where(eq(rewardsTable.id, rewardId));
    if (!reward || reward.quantity <= 0) return false;

    const cost = (reward.discountCost || reward.defaultCost) * quantity;

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
    if (!profile) return false;

    // reduce inventory amount
    await tx.update(rewardsTable).set({
      quantity: sql`${rewardsTable.quantity} - ${quantity}`,
    });
    // add transaction
    await tx.insert(creditTransactionsTable).values({
      profileId,
      amount: -cost,
    });
    // update current total
    await tx.update(rewardsProfilesTable).set({
      //TODO: add total and update current
    });
  });

  return isRedeemed;
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
      points: rewardsProfilesTable.earnedCredits,
    })
    .from(rewardsProfilesTable)
    .orderBy(sql`points DESC`)
    .limit(N);

  return leaderboard;
};
