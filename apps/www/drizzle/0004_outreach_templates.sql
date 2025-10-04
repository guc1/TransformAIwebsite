ALTER TABLE "outreach_pages"
  ADD COLUMN "template_id" integer NOT NULL DEFAULT 1,
  ADD COLUMN "booked_meeting" boolean NOT NULL DEFAULT false,
  ADD COLUMN "booked_meeting_at" timestamp with time zone;
