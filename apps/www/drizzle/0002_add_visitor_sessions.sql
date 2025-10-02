CREATE TABLE IF NOT EXISTS "visitor_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "visitor_sessions_created_at_idx" ON "visitor_sessions" ("created_at");
