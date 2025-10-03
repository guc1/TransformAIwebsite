CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "hours_saved_states" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
  "base_amount" integer NOT NULL DEFAULT 0,
  "base_set_at" timestamptz NOT NULL DEFAULT now(),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "hours_saved_increments" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
  "state_id" text NOT NULL,
  "scheduled_for" timestamptz NOT NULL,
  "amount" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "hours_saved_states"
  ADD COLUMN IF NOT EXISTS "base_amount" integer;

ALTER TABLE "hours_saved_states"
  ADD COLUMN IF NOT EXISTS "base_set_at" timestamptz;

ALTER TABLE "hours_saved_states"
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz;

ALTER TABLE "hours_saved_states"
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "base_amount" SET DEFAULT 0;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "base_amount" TYPE integer USING "base_amount"::integer;

UPDATE "hours_saved_states"
SET "base_amount" = 0
WHERE "base_amount" IS NULL;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "base_amount" SET NOT NULL;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "base_set_at" SET DEFAULT now();

UPDATE "hours_saved_states"
SET "base_set_at" = now()
WHERE "base_set_at" IS NULL;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "base_set_at" TYPE timestamptz USING "base_set_at"::timestamptz;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "base_set_at" SET NOT NULL;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "created_at" SET DEFAULT now();

UPDATE "hours_saved_states"
SET "created_at" = now()
WHERE "created_at" IS NULL;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "created_at" TYPE timestamptz USING "created_at"::timestamptz;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "created_at" SET NOT NULL;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "updated_at" SET DEFAULT now();

UPDATE "hours_saved_states"
SET "updated_at" = now()
WHERE "updated_at" IS NULL;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "updated_at" TYPE timestamptz USING "updated_at"::timestamptz;

ALTER TABLE "hours_saved_states"
  ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "hours_saved_increments"
  ADD COLUMN IF NOT EXISTS "state_id" text;

ALTER TABLE "hours_saved_increments"
  ADD COLUMN IF NOT EXISTS "scheduled_for" timestamptz;

ALTER TABLE "hours_saved_increments"
  ADD COLUMN IF NOT EXISTS "amount" integer;

ALTER TABLE "hours_saved_increments"
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz;

ALTER TABLE "hours_saved_increments"
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "state_id" SET NOT NULL;

UPDATE "hours_saved_increments"
SET "scheduled_for" = now()
WHERE "scheduled_for" IS NULL;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "scheduled_for" TYPE timestamptz USING "scheduled_for"::timestamptz;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "scheduled_for" SET NOT NULL;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "state_id" TYPE text USING "state_id"::text;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "amount" TYPE integer USING "amount"::integer;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "amount" SET DEFAULT 0;

UPDATE "hours_saved_increments"
SET "amount" = 0
WHERE "amount" IS NULL;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "amount" SET NOT NULL;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "created_at" SET DEFAULT now();

UPDATE "hours_saved_increments"
SET "created_at" = now()
WHERE "created_at" IS NULL;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "created_at" SET NOT NULL;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "updated_at" SET DEFAULT now();

UPDATE "hours_saved_increments"
SET "updated_at" = now()
WHERE "updated_at" IS NULL;

ALTER TABLE "hours_saved_increments"
  ALTER COLUMN "updated_at" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'hours_saved_increments_state_id_fkey'
      AND table_name = 'hours_saved_increments'
  ) THEN
    ALTER TABLE "hours_saved_increments"
      ADD CONSTRAINT "hours_saved_increments_state_id_fkey"
      FOREIGN KEY ("state_id") REFERENCES "hours_saved_states"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "hours_saved_increments_state_time_idx"
  ON "hours_saved_increments" ("state_id", "scheduled_for");

CREATE INDEX IF NOT EXISTS "hours_saved_increments_scheduled_for_idx"
  ON "hours_saved_increments" ("scheduled_for");
