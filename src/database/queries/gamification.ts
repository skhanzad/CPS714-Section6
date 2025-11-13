import { gt, eq, sql } from "drizzle-orm";
import { db } from "../connection";
import {
  rewardsTable,
  redeemedRewardsTable,
  creditTransactionsTable,
  rewardsProfilesTable,
  usersTable,
} from "../schema";


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