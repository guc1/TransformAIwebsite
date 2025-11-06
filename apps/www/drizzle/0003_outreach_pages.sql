CREATE TABLE IF NOT EXISTS "outreach_pages" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "display_name" text NOT NULL,
  "display_text" text NOT NULL,
  "visit_count" integer DEFAULT 0 NOT NULL,
  "first_visited_at" timestamp with time zone,
  "last_visited_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "outreach_pages_slug_unique" ON "outreach_pages" ("slug");
