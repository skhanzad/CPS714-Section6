import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { PoolConfig } from "pg";
import * as schema from "./schema";
import * as relations from "./relations";

const connection: PoolConfig = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
};

export const db = drizzle({
  connection,
  schema: {
    ...schema,
    ...relations,
  },
});
