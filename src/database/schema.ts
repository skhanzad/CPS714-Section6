import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  smallint,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  studentId: text("student_id").notNull(),
  password: text("password").notNull(),
  permissionLevel: smallint("permission_level").notNull().default(0),
});

export const eventsTable = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
});

export const rewardsProfilesTable = pgTable("rewards_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  earnedCredits: integer("earned_credits").notNull().default(0),
  currentCredits: integer("current_credits").notNull().default(0),
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
