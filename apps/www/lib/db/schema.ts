import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const userRoleEnum = pgEnum("user_role", ["client", "staff"]);

export const meetingSlotStatusEnum = pgEnum("meeting_slot_status", [
  "available",
  "booked",
  "unavailable",
]);

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image: text("image"),
    role: userRoleEnum("role").notNull().default("client"),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_unique").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    oauth_token_secret: text("oauth_token_secret"),
    oauth_token: text("oauth_token"),
  },
  (table) => ({
    compoundPk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
    userIdx: index("accounts_user_id_idx").on(table.userId),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    userIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    compositePk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
);

export const meetingSlots = pgTable(
  "meeting_slots",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    startAt: timestamp("start_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    endAt: timestamp("end_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    status: meetingSlotStatusEnum("status").notNull().default("available"),
    publicDescription: text("public_description"),
    assignedStaffId: text("assigned_staff_id").references(() => users.id, {
      onDelete: "set null",
    }),
    assignedStaffName: text("assigned_staff_name"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    startIdx: index("meeting_slots_start_at_idx").on(table.startAt),
    statusIdx: index("meeting_slots_status_idx").on(table.status),
  }),
);

export const meetingBookings = pgTable(
  "meeting_bookings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slotId: text("slot_id")
      .notNull()
      .references(() => meetingSlots.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    company: text("company"),
    personName: text("person_name").notNull(),
    email: text("email").notNull(),
    description: text("description"),
    locale: text("locale"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    slotIdx: uniqueIndex("meeting_bookings_slot_unique").on(table.slotId),
    emailIdx: index("meeting_bookings_email_idx").on(table.email),
  }),
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email").notNull(),
    requestType: text("request_type").notNull(),
    description: text("description").notNull(),
    locale: text("locale").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    createdAtIdx: index("contact_messages_created_at_idx").on(table.createdAt),
    requestTypeIdx: index("contact_messages_request_type_idx").on(
      table.requestType,
    ),
  }),
);

export const visitorSessions = pgTable(
  "visitor_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    createdAtIdx: index("visitor_sessions_created_at_idx").on(table.createdAt),
  }),
);

export const hoursSavedStates = pgTable("hours_saved_states", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  baseAmount: integer("base_amount").notNull().default(0),
  baseSetAt: timestamp("base_set_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  autoDailyTarget: integer("auto_daily_target").notNull().default(10_000),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const hoursSavedIncrements = pgTable(
  "hours_saved_increments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    stateId: text("state_id")
      .notNull()
      .references(() => hoursSavedStates.id, { onDelete: "cascade" }),
    scheduledFor: timestamp("scheduled_for", { mode: "date", withTimezone: true }).notNull(),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    scheduleTimeIdx: uniqueIndex("hours_saved_increments_state_time_idx").on(
      table.stateId,
      table.scheduledFor,
    ),
    scheduledForIdx: index("hours_saved_increments_scheduled_for_idx").on(table.scheduledFor),
  }),
);

export const outreachPages = pgTable(
  "outreach_pages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull(),
    displayName: text("display_name").notNull(),
    displayText: text("display_text").notNull(),
    templateId: integer("template_id").notNull().default(1),
    campaign: text("campaign").notNull(),
    sub: text("sub").notNull(),
    bookedMeeting: boolean("booked_meeting").notNull().default(false),
    bookedMeetingAt: timestamp("booked_meeting_at", { mode: "date", withTimezone: true }),
    visitCount: integer("visit_count").notNull().default(0),
    firstVisitedAt: timestamp("first_visited_at", { mode: "date", withTimezone: true }),
    lastVisitedAt: timestamp("last_visited_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("outreach_pages_slug_unique").on(table.slug),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  meetingSlots: many(meetingSlots, { relationName: "assignedStaff" }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const meetingSlotsRelations = relations(meetingSlots, ({ one }) => ({
  assignedStaff: one(users, {
    relationName: "assignedStaff",
    fields: [meetingSlots.assignedStaffId],
    references: [users.id],
  }),
  booking: one(meetingBookings, {
    fields: [meetingSlots.id],
    references: [meetingBookings.slotId],
  }),
}));

export const meetingBookingsRelations = relations(meetingBookings, ({ one }) => ({
  slot: one(meetingSlots, {
    fields: [meetingBookings.slotId],
    references: [meetingSlots.id],
  }),
}));

export const hoursSavedStatesRelations = relations(hoursSavedStates, ({ many }) => ({
  increments: many(hoursSavedIncrements),
}));

export const hoursSavedIncrementsRelations = relations(hoursSavedIncrements, ({ one }) => ({
  state: one(hoursSavedStates, {
    fields: [hoursSavedIncrements.stateId],
    references: [hoursSavedStates.id],
  }),
}));

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type MeetingSlotStatus =
  (typeof meetingSlotStatusEnum.enumValues)[number];
