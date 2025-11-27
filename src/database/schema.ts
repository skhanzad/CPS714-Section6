import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import "dotenv/config";
import { Client } from "pg";

const clientConfig = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : undefined,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
};

let client: Client;
//Connects to postgres using node-postgres
export default async function getDb(): Promise<Client> {
    if (!client) {
        console.log("Database config:", {
          host: clientConfig.host,
          port: clientConfig.port,
          user: clientConfig.user,
          database: clientConfig.database,
          password: clientConfig.password ? "***" : undefined,
        });
        client = new Client(clientConfig);
        try {
          await client.connect();
          console.log("Database connected");
        } catch (err) {
          console.error("Database connection error:", err);
          throw err;
        }
    }
    return client;
}

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

// Table to track redeemed rewards

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
