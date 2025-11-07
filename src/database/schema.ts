import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
});

export const eventsTable = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
});

export const rewardsProfilesTable = pgTable("rewards_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  totalCredits: integer("total_credits").notNull().default(0),
});

export const creditTransactionsTable = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => rewardsProfilesTable.id),
  eventId: uuid("event_id").references(() => eventsTable.id),
  amount: integer("amount").notNull(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
});

export const rewardsTable = pgTable("rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  item: text("item").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  quantity: integer("quantity").notNull(),
  defaultCost: integer("default_cost").notNull(),
  discountCost: integer("discount_cost"),
  listedAt: timestamp("listed_at").defaultNow().notNull(),
});

export const redeemedRewardsTable = pgTable("redeemed_rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  rewardId: uuid("reward_id")
    .notNull()
    .references(() => rewardsTable.id),
  totalCost: integer("total_cost").notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
});
