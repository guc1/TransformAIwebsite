import { defineConfig } from "drizzle-kit";

import { serverEnv } from "./lib/env";

const env = serverEnv();

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
