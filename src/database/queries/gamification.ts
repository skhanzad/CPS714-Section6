import { gt } from "drizzle-orm";
import { db } from "../connection";
import { rewardsTable } from "../schema";

export const listAvailableRewards = async () => {
  const availableRewards = await db
    .select()
    .from(rewardsTable)
    .where(gt(rewardsTable.quantity, 0));

  return availableRewards;
};
