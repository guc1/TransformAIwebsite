import { and, asc, eq, gt, gte, lt, lte } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { hoursSavedAdjustments, hoursSavedConfig } from "@/lib/db/schema";
import { MEETING_TIME_ZONE } from "@/lib/meetings/constants";

const HOURS_SAVED_CONFIG_ID = "singleton" as const;
export const HOURS_SAVED_TIME_ZONE = MEETING_TIME_ZONE;
const DEFAULT_DAY_INCREMENT = 104;
const DEFAULT_NIGHT_INCREMENT = 65;
const DEFAULT_BASE_AMOUNT = 100_000;
const HOUR_VARIATION_RATIO = 0.15;
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;

export type HoursSavedConfig = typeof hoursSavedConfig.$inferSelect;
export type HoursSavedAdjustment = typeof hoursSavedAdjustments.$inferSelect & {
  period: "day" | "night";
};

export type HoursSavedSummary = {
  total: number;
  lastAppliedAt: Date;
  nextUpdateAt: Date | null;
};

type ConfigRecord = typeof hoursSavedConfig.$inferSelect;

export async function getHoursSavedSummary(): Promise<HoursSavedSummary> {
  const config = await ensureHoursSavedConfig();
  await ensureUpcomingAdjustments(config);
  return computeSummary(config);
}

export async function getHoursSavedDashboardData(): Promise<{
  config: ConfigRecord;
  summary: HoursSavedSummary;
  upcoming: HoursSavedAdjustment[];
}> {
  const config = await ensureHoursSavedConfig();
  await ensureUpcomingAdjustments(config);

  const summary = await computeSummary(config);
  const upcoming = await getUpcomingAdjustments(config);

  return { config, summary, upcoming };
}

export async function saveHoursSavedSettings(input: {
  baseAmount: number;
  dayIncrement: number;
  nightIncrement: number;
}): Promise<void> {
  const existing = await getHoursSavedConfig();
  const now = new Date();
  const baseTimestamp =
    existing && existing.baseAmount === input.baseAmount
      ? existing.baseTimestamp
      : now;

  await db
    .insert(hoursSavedConfig)
    .values({
      id: HOURS_SAVED_CONFIG_ID,
      baseAmount: input.baseAmount,
      baseTimestamp,
      dayIncrement: input.dayIncrement,
      nightIncrement: input.nightIncrement,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: hoursSavedConfig.id,
      set: {
        baseAmount: input.baseAmount,
        baseTimestamp,
        dayIncrement: input.dayIncrement,
        nightIncrement: input.nightIncrement,
        updatedAt: now,
      },
    });

  const nextConfig: ConfigRecord = existing
    ? {
        ...existing,
        baseAmount: input.baseAmount,
        baseTimestamp,
        dayIncrement: input.dayIncrement,
        nightIncrement: input.nightIncrement,
        updatedAt: now,
      }
    : {
        id: HOURS_SAVED_CONFIG_ID,
        baseAmount: input.baseAmount,
        baseTimestamp,
        dayIncrement: input.dayIncrement,
        nightIncrement: input.nightIncrement,
        updatedAt: now,
      };

  await ensureUpcomingAdjustments(nextConfig);
}

export async function regenerateHoursSavedPlan(hours = 24): Promise<void> {
  const config = await ensureHoursSavedConfig();
  const now = new Date();
  const nextHour = addHours(startOfHour(now), 1);

  await db
    .delete(hoursSavedAdjustments)
    .where(gte(hoursSavedAdjustments.applyAt, nextHour));

  await createAdjustments(config, nextHour, hours);
}

export async function updateHoursSavedAdjustment(input: {
  id: string;
  amount: number;
}): Promise<void> {
  await db
    .update(hoursSavedAdjustments)
    .set({ amount: input.amount })
    .where(eq(hoursSavedAdjustments.id, input.id));
}

async function computeSummary(config: ConfigRecord): Promise<HoursSavedSummary> {
  const now = new Date();
  const appliedAdjustments = await db
    .select({
      applyAt: hoursSavedAdjustments.applyAt,
      amount: hoursSavedAdjustments.amount,
    })
    .from(hoursSavedAdjustments)
    .where(
      and(
        gte(hoursSavedAdjustments.applyAt, config.baseTimestamp),
        lte(hoursSavedAdjustments.applyAt, now),
      ),
    )
    .orderBy(asc(hoursSavedAdjustments.applyAt));

  const total = appliedAdjustments.reduce(
    (acc, adjustment) => acc + adjustment.amount,
    config.baseAmount,
  );

  const lastAppliedAt =
    appliedAdjustments[appliedAdjustments.length - 1]?.applyAt ?? config.baseTimestamp;

  const [nextAdjustment] = await db
    .select({ applyAt: hoursSavedAdjustments.applyAt })
    .from(hoursSavedAdjustments)
    .where(gt(hoursSavedAdjustments.applyAt, now))
    .orderBy(asc(hoursSavedAdjustments.applyAt))
    .limit(1);

  return {
    total,
    lastAppliedAt,
    nextUpdateAt: nextAdjustment?.applyAt ?? null,
  };
}

async function ensureHoursSavedConfig(): Promise<ConfigRecord> {
  const existing = await getHoursSavedConfig();
  if (existing) {
    return existing;
  }

  const now = new Date();
  const [inserted] = await db
    .insert(hoursSavedConfig)
    .values({
      id: HOURS_SAVED_CONFIG_ID,
      baseAmount: DEFAULT_BASE_AMOUNT,
      baseTimestamp: now,
      dayIncrement: DEFAULT_DAY_INCREMENT,
      nightIncrement: DEFAULT_NIGHT_INCREMENT,
    })
    .returning();

  return inserted;
}

async function getHoursSavedConfig(): Promise<ConfigRecord | null> {
  return db.query.hoursSavedConfig.findFirst({
    where: eq(hoursSavedConfig.id, HOURS_SAVED_CONFIG_ID),
  });
}

async function ensureUpcomingAdjustments(config: ConfigRecord, hours = 24): Promise<void> {
  const now = new Date();
  const nextHour = addHours(startOfHour(now), 1);
  const horizon = addHours(nextHour, hours);

  const existing = await db
    .select({ applyAt: hoursSavedAdjustments.applyAt })
    .from(hoursSavedAdjustments)
    .where(
      and(
        gte(hoursSavedAdjustments.applyAt, nextHour),
        lt(hoursSavedAdjustments.applyAt, horizon),
      ),
    )
    .orderBy(asc(hoursSavedAdjustments.applyAt));

  const existingSet = new Set(existing.map((item) => item.applyAt.toISOString()));
  const missingSlots: Date[] = [];

  for (let index = 0; index < hours; index += 1) {
    const slot = addHours(nextHour, index);
    if (!existingSet.has(slot.toISOString())) {
      missingSlots.push(slot);
    }
  }

  if (missingSlots.length === 0) {
    return;
  }

  await createAdjustments(config, missingSlots[0], missingSlots.length, missingSlots);
}

async function getUpcomingAdjustments(config: ConfigRecord, hours = 24): Promise<HoursSavedAdjustment[]> {
  const now = new Date();
  const nextHour = addHours(startOfHour(now), 1);
  const horizon = addHours(nextHour, hours);

  const results = await db
    .select({
      id: hoursSavedAdjustments.id,
      applyAt: hoursSavedAdjustments.applyAt,
      amount: hoursSavedAdjustments.amount,
    })
    .from(hoursSavedAdjustments)
    .where(
      and(
        gte(hoursSavedAdjustments.applyAt, nextHour),
        lt(hoursSavedAdjustments.applyAt, horizon),
      ),
    )
    .orderBy(asc(hoursSavedAdjustments.applyAt));

  return results.map((record) => ({
    ...record,
    period: isDaytime(record.applyAt) ? "day" : "night",
  }));
}

async function createAdjustments(
  config: ConfigRecord,
  start: Date,
  hours: number,
  predefinedSlots?: Date[],
): Promise<void> {
  const slots = predefinedSlots ?? Array.from({ length: hours }, (_, index) => addHours(start, index));

  const values = slots.map((slot) => ({
    applyAt: slot,
    amount: generateRandomIncrement(isDaytime(slot) ? config.dayIncrement : config.nightIncrement),
  }));

  if (values.length === 0) {
    return;
  }

  await db.insert(hoursSavedAdjustments).values(values);
}

function generateRandomIncrement(base: number): number {
  const variation = Math.max(1, Math.round(base * HOUR_VARIATION_RATIO));
  const min = Math.max(1, base - variation);
  const max = base + variation;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isDaytime(date: Date): boolean {
  const hour = getHourInTimeZone(date, HOURS_SAVED_TIME_ZONE);
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR;
}

function getHourInTimeZone(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone,
  });
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((part) => part.type === "hour");
  return hourPart ? Number.parseInt(hourPart.value, 10) : date.getUTCHours();
}

function startOfHour(date: Date): Date {
  const clone = new Date(date);
  clone.setMinutes(0, 0, 0);
  return clone;
}

function addHours(date: Date, hours: number): Date {
  const clone = new Date(date);
  clone.setHours(clone.getHours() + hours);
  return clone;
}

