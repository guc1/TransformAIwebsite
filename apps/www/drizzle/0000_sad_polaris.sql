CREATE TYPE "public"."meeting_slot_status" AS ENUM('available', 'booked', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('client', 'staff');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"oauth_token_secret" text,
	"oauth_token" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"email" text NOT NULL,
	"request_type" text NOT NULL,
	"description" text NOT NULL,
	"locale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hours_saved_increments" (
	"id" text PRIMARY KEY NOT NULL,
	"state_id" text NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hours_saved_states" (
	"id" text PRIMARY KEY NOT NULL,
	"base_amount" integer DEFAULT 0 NOT NULL,
	"base_set_at" timestamp with time zone DEFAULT now() NOT NULL,
	"auto_daily_target" integer DEFAULT 10000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_bookings" (
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
--> statement-breakpoint
CREATE TABLE "meeting_slots" (
	"id" text PRIMARY KEY NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" "meeting_slot_status" DEFAULT 'available' NOT NULL,
	"public_description" text,
	"assigned_staff_id" text,
	"assigned_staff_name" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"display_text" text NOT NULL,
	"template_id" integer DEFAULT 1 NOT NULL,
	"booked_meeting" boolean DEFAULT false NOT NULL,
	"booked_meeting_at" timestamp with time zone,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"first_visited_at" timestamp with time zone,
	"last_visited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"password_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "visitor_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hours_saved_increments" ADD CONSTRAINT "hours_saved_increments_state_id_hours_saved_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."hours_saved_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_bookings" ADD CONSTRAINT "meeting_bookings_slot_id_meeting_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."meeting_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_slots" ADD CONSTRAINT "meeting_slots_assigned_staff_id_users_id_fk" FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_messages_request_type_idx" ON "contact_messages" USING btree ("request_type");--> statement-breakpoint
CREATE UNIQUE INDEX "hours_saved_increments_state_time_idx" ON "hours_saved_increments" USING btree ("state_id","scheduled_for");--> statement-breakpoint
CREATE INDEX "hours_saved_increments_scheduled_for_idx" ON "hours_saved_increments" USING btree ("scheduled_for");--> statement-breakpoint
CREATE UNIQUE INDEX "meeting_bookings_slot_unique" ON "meeting_bookings" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "meeting_bookings_email_idx" ON "meeting_bookings" USING btree ("email");--> statement-breakpoint
CREATE INDEX "meeting_slots_start_at_idx" ON "meeting_slots" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "meeting_slots_status_idx" ON "meeting_slots" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "outreach_pages_slug_unique" ON "outreach_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "visitor_sessions_created_at_idx" ON "visitor_sessions" USING btree ("created_at");