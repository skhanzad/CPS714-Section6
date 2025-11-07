import { relations } from "drizzle-orm";
import {
  usersTable,
  rewardsProfilesTable,
  redeemedRewardsTable,
  eventsTable,
  creditTransactionsTable,
  rewardsTable,
} from "./schema";

export const usersRelations = relations(usersTable, ({ many }) => ({
  rewardsProfiles: many(rewardsProfilesTable),
  redeemedRewards: many(redeemedRewardsTable),
}));

export const eventsRelations = relations(eventsTable, ({ many }) => ({
  creditTransactions: many(creditTransactionsTable),
}));

export const rewardsProfilesRelations = relations(
  rewardsProfilesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [rewardsProfilesTable.userId],
      references: [usersTable.id],
    }),
    creditTransactions: many(creditTransactionsTable),
  })
);

export const creditTransactionsRelations = relations(
  creditTransactionsTable,
  ({ one }) => ({
    rewardsProfile: one(rewardsProfilesTable, {
      fields: [creditTransactionsTable.profileId],
      references: [rewardsProfilesTable.id],
    }),
    event: one(eventsTable, {
      fields: [creditTransactionsTable.eventId],
      references: [eventsTable.id],
    }),
  })
);

export const rewardsRelations = relations(rewardsTable, ({ many }) => ({
  redeemedRewards: many(redeemedRewardsTable),
}));

export const redeemedRewardsRelations = relations(
  redeemedRewardsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [redeemedRewardsTable.userId],
      references: [usersTable.id],
    }),
    reward: one(rewardsTable, {
      fields: [redeemedRewardsTable.rewardId],
      references: [rewardsTable.id],
    }),
  })
);
