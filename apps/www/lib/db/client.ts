import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

const env = serverEnv();

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  conn?: Pool;
  db?: DbInstance;
};

const connection =
  globalForDb.conn ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = connection;
}

export const db =
  globalForDb.db ??
  drizzle<typeof schema>(connection, {
    schema,
    logger: process.env.NODE_ENV === "development",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

export type DrizzleDB = typeof db;
