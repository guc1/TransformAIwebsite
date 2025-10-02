CREATE TABLE IF NOT EXISTS "hours_saved_config" (
  "id" text PRIMARY KEY NOT NULL DEFAULT 'singleton',
  "base_amount" bigint NOT NULL,
  "base_timestamp" timestamptz DEFAULT now() NOT NULL,
  "day_increment" integer NOT NULL,
  "night_increment" integer NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "hours_saved_adjustments" (
  "id" text PRIMARY KEY NOT NULL,
  "apply_at" timestamptz NOT NULL,
  "amount" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "hours_saved_adjustments_apply_at_unique" ON "hours_saved_adjustments" ("apply_at");
CREATE INDEX IF NOT EXISTS "hours_saved_adjustments_apply_at_idx" ON "hours_saved_adjustments" ("apply_at");
