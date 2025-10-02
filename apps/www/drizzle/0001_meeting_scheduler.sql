CREATE TYPE "meeting_slot_status" AS ENUM ('available', 'booked', 'unavailable');

CREATE TABLE IF NOT EXISTS "meeting_slots" (
  "id" text PRIMARY KEY NOT NULL,
  "start_at" timestamptz NOT NULL,
  "end_at" timestamptz NOT NULL,
  "status" "meeting_slot_status" DEFAULT 'available' NOT NULL,
  "public_description" text,
  "assigned_staff_id" text,
  "assigned_staff_name" text,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "meeting_slots_start_at_idx" ON "meeting_slots" ("start_at");
CREATE INDEX IF NOT EXISTS "meeting_slots_status_idx" ON "meeting_slots" ("status");

ALTER TABLE "meeting_slots"
  ADD CONSTRAINT "meeting_slots_assigned_staff_id_users_id_fk"
  FOREIGN KEY ("assigned_staff_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;

CREATE TABLE IF NOT EXISTS "meeting_bookings" (
  "id" text PRIMARY KEY NOT NULL,
  "slot_id" text NOT NULL,
  "reason" text NOT NULL,
  "company" text,
  "person_name" text NOT NULL,
  "email" text NOT NULL,
  "description" text,
  "locale" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "meeting_bookings_slot_unique" ON "meeting_bookings" ("slot_id");
CREATE INDEX IF NOT EXISTS "meeting_bookings_email_idx" ON "meeting_bookings" ("email");

ALTER TABLE "meeting_bookings"
  ADD CONSTRAINT "meeting_bookings_slot_id_meeting_slots_id_fk"
  FOREIGN KEY ("slot_id") REFERENCES "meeting_slots"("id") ON DELETE cascade ON UPDATE no action;
