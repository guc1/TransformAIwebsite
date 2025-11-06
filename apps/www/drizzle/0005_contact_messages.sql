CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "company" text,
  "email" text NOT NULL,
  "request_type" text NOT NULL,
  "description" text NOT NULL,
  "locale" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "contact_messages_created_at_idx" ON "contact_messages" ("created_at");
CREATE INDEX IF NOT EXISTS "contact_messages_request_type_idx" ON "contact_messages" ("request_type");
