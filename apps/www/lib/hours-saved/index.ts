import { and, asc, eq, gte, lt, lte } from "drizzle-orm";

import { db, type DrizzleDB } from "@/lib/db/client";
import { hoursSavedIncrements, hoursSavedStates } from "@/lib/db/schema";

import {
  HOURS_SAVED_WINDOW_HOURS,
  addHours,
  getDefaultIncrementFor,
  nextHour,
  randomizeWithinHour,
  startOfHour,
} from "./constants";

export type HoursSavedScheduleEntry = {
  scheduledFor: Date;
  amount: number;
};

export type HoursSavedOverview = {
  baseAmount: number;
  baseSetAt: Date;
  currentAmount: number;
  nextUpdateAt: Date | null;
  schedule: HoursSavedScheduleEntry[];
};

type DbExecutor = DrizzleDB;

async function ensureState(executor: DbExecutor = db) {
  const existing = await executor.query.hoursSavedStates.findFirst();

  if (existing) {
    return existing;
  }

  const [created] = await executor
    .insert(hoursSavedStates)
    .values({
      baseAmount: 0,
      baseSetAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (!created) {
    throw new Error("Failed to initialize hours saved state");
  }

  return created;
}

async function ensureUpcomingSchedule(
  executor: DbExecutor,
  stateId: string,
  now: Date,
) {
  const windowStart = nextHour(now);
  const windowEnd = addHours(windowStart, HOURS_SAVED_WINDOW_HOURS);

  const existing = await executor
    .select({ scheduledFor: hoursSavedIncrements.scheduledFor })
    .from(hoursSavedIncrements)
    .where(
      and(
        eq(hoursSavedIncrements.stateId, stateId),
        gte(hoursSavedIncrements.scheduledFor, windowStart),
        lt(hoursSavedIncrements.scheduledFor, windowEnd),
      ),
    );

  const existingHourKeys = new Set(
    existing.map((entry) => startOfHour(entry.scheduledFor).toISOString()),
  );
  const usedTimestamps = new Set(existing.map((entry) => entry.scheduledFor.getTime()));
  const inserts: { stateId: string; scheduledFor: Date; amount: number }[] = [];

  for (let offset = 0; offset < HOURS_SAVED_WINDOW_HOURS; offset += 1) {
    const hourStart = addHours(windowStart, offset);
    if (existingHourKeys.has(hourStart.toISOString())) {
      continue;
    }

    const scheduledFor = randomizeWithinHour(hourStart, usedTimestamps);
    existingHourKeys.add(hourStart.toISOString());

    inserts.push({
      stateId,
      scheduledFor,
      amount: getDefaultIncrementFor(scheduledFor),
    });
  }

  if (inserts.length > 0) {
    await executor.insert(hoursSavedIncrements).values(inserts);
  }
}

async function sumAppliedIncrements(
  executor: DbExecutor,
  stateId: string,
  baseSetAt: Date,
  now: Date,
) {
  const rows = await executor
    .select({ amount: hoursSavedIncrements.amount })
    .from(hoursSavedIncrements)
    .where(
      and(
        eq(hoursSavedIncrements.stateId, stateId),
        gte(hoursSavedIncrements.scheduledFor, baseSetAt),
        lte(hoursSavedIncrements.scheduledFor, now),
      ),
    );

  return rows.reduce((total, row) => total + row.amount, 0);
}

export async function getHoursSavedOverview(now: Date = new Date()): Promise<HoursSavedOverview> {
  const state = await ensureState();

  await ensureUpcomingSchedule(db, state.id, now);

  const applied = await sumAppliedIncrements(db, state.id, state.baseSetAt, now);

  const windowStart = nextHour(now);
  const windowEnd = addHours(windowStart, HOURS_SAVED_WINDOW_HOURS);

  const scheduleRows = await db
    .select({
      scheduledFor: hoursSavedIncrements.scheduledFor,
      amount: hoursSavedIncrements.amount,
    })
    .from(hoursSavedIncrements)
    .where(
      and(
        eq(hoursSavedIncrements.stateId, state.id),
        gte(hoursSavedIncrements.scheduledFor, windowStart),
        lt(hoursSavedIncrements.scheduledFor, windowEnd),
      ),
    )
    .orderBy(asc(hoursSavedIncrements.scheduledFor));

  const seenHours = new Set<string>();
  const scheduleEntries: HoursSavedScheduleEntry[] = [];

  for (const row of scheduleRows) {
    const hourKey = startOfHour(row.scheduledFor).toISOString();

    if (seenHours.has(hourKey)) {
      continue;
    }

    seenHours.add(hourKey);
    scheduleEntries.push({
      scheduledFor: row.scheduledFor,
      amount: row.amount,
    });

    if (scheduleEntries.length === HOURS_SAVED_WINDOW_HOURS) {
      break;
    }
  }

  return {
    baseAmount: state.baseAmount,
    baseSetAt: state.baseSetAt,
    currentAmount: state.baseAmount + applied,
    nextUpdateAt: scheduleEntries[0]?.scheduledFor ?? null,
    schedule: scheduleEntries,
  };
}

export async function updateHoursSavedSettings(input: {
  baseAmount: number;
  schedule: HoursSavedScheduleEntry[];
  now?: Date;
}): Promise<HoursSavedOverview> {
  const reference = input.now ?? new Date();

  await db.transaction(async (tx) => {
    const executor = tx as unknown as DbExecutor;
    const state = await ensureState(executor);

    const baseSetAt = reference;

    await executor
      .update(hoursSavedStates)
      .set({
        baseAmount: input.baseAmount,
        baseSetAt,
        updatedAt: new Date(),
      })
      .where(eq(hoursSavedStates.id, state.id));

    await executor
      .delete(hoursSavedIncrements)
      .where(
        and(
          eq(hoursSavedIncrements.stateId, state.id),
          lt(hoursSavedIncrements.scheduledFor, baseSetAt),
        ),
      );

    const windowStart = nextHour(reference);
    const windowEnd = addHours(windowStart, HOURS_SAVED_WINDOW_HOURS);

    await executor
      .delete(hoursSavedIncrements)
      .where(
        and(
          eq(hoursSavedIncrements.stateId, state.id),
          gte(hoursSavedIncrements.scheduledFor, windowStart),
          lt(hoursSavedIncrements.scheduledFor, windowEnd),
        ),
      );

    if (input.schedule.length > 0) {
      const values = input.schedule.map((entry) => ({
        stateId: state.id,
        scheduledFor: entry.scheduledFor,
        amount: entry.amount,
        updatedAt: new Date(),
      }));

      await executor.insert(hoursSavedIncrements).values(values);
    }

    await ensureUpcomingSchedule(executor, state.id, reference);
  });

  return getHoursSavedOverview(reference);
}
