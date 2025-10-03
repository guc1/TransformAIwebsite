import { and, asc, eq, gte, lt, lte } from "drizzle-orm";

import { db, type DrizzleDB } from "@/lib/db/client";
import { hoursSavedIncrements, hoursSavedStates } from "@/lib/db/schema";

import {
  HOURS_SAVED_MAX_EVENTS_PER_HOUR,
  HOURS_SAVED_MIN_EVENTS_PER_HOUR,
  HOURS_SAVED_WINDOW_HOURS,
  addHours,
  getDefaultIncrementFor,
  nextHour,
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

type GeneratedIncrement = { scheduledFor: Date; amount: number };

function randomInt(min: number, max: number): number {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function distributeAmounts(total: number, count: number): number[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [total];
  }

  const breakpoints = Array.from({ length: count - 1 }, () => Math.random()).sort((a, b) => a - b);
  const fractions: number[] = [];
  let previous = 0;

  for (const point of breakpoints) {
    fractions.push(point - previous);
    previous = point;
  }
  fractions.push(1 - previous);

  let amounts = fractions.map((fraction) => Math.max(0, Math.round(fraction * total)));
  let sum = amounts.reduce((acc, value) => acc + value, 0);

  if (total >= count) {
    amounts = amounts.map((value) => (value <= 0 ? 1 : value));
    sum = amounts.reduce((acc, value) => acc + value, 0);
  }

  while (sum > total) {
    for (let index = 0; index < amounts.length && sum > total; index += 1) {
      if (amounts[index] > 1) {
        amounts[index] -= 1;
        sum -= 1;
      }
    }
    if (sum === total) {
      break;
    }
  }

  let cursor = 0;
  while (sum < total) {
    amounts[cursor % amounts.length] += 1;
    sum += 1;
    cursor += 1;
  }

  return amounts;
}

function generateRandomizedIncrements(total: number, hourStart: Date): GeneratedIncrement[] {
  if (total <= 0) {
    return [
      {
        scheduledFor: new Date(hourStart),
        amount: 0,
      },
    ];
  }

  const maxEvents = Math.max(1, Math.min(HOURS_SAVED_MAX_EVENTS_PER_HOUR, total));
  const minEvents = Math.max(1, Math.min(HOURS_SAVED_MIN_EVENTS_PER_HOUR, maxEvents));
  const eventCount = total < minEvents ? total : randomInt(minEvents, maxEvents);

  const amounts = distributeAmounts(total, Math.max(1, eventCount));
  const scheduled: GeneratedIncrement[] = [];
  const usedSlots = new Set<string>();

  for (const amount of amounts) {
    const scheduledFor = new Date(hourStart);

    if (amount === 0 && amounts.length > 1) {
      // Skip zero entries when there are other positive chunks to avoid unnecessary updates.
      continue;
    }

    if (amount === 0) {
      scheduled.push({ scheduledFor, amount });
      continue;
    }

    let minute = 0;
    let second = 0;
    let key = "";

    do {
      minute = randomInt(0, 59);
      second = randomInt(0, 59);
      key = `${minute}:${second}`;
    } while (usedSlots.has(key));

    usedSlots.add(key);
    scheduledFor.setMinutes(minute, second, 0);
    scheduled.push({ scheduledFor, amount });
  }

  scheduled.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());

  return scheduled;
}

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
    )
    .orderBy(asc(hoursSavedIncrements.scheduledFor));

  const existingByHour = new Map<string, number>();
  for (const row of existing) {
    const hourStart = startOfHour(row.scheduledFor);
    existingByHour.set(hourStart.toISOString(), 1);
  }

  const inserts: { stateId: string; scheduledFor: Date; amount: number }[] = [];

  for (let offset = 0; offset < HOURS_SAVED_WINDOW_HOURS; offset += 1) {
    const hourStart = addHours(windowStart, offset);
    const key = hourStart.toISOString();

    if (existingByHour.has(key)) {
      continue;
    }

    const total = getDefaultIncrementFor(hourStart);
    const generated = generateRandomizedIncrements(total, hourStart);

    for (const entry of generated) {
      inserts.push({
        stateId,
        scheduledFor: entry.scheduledFor,
        amount: entry.amount,
      });
    }
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
    .select({ scheduledFor: hoursSavedIncrements.scheduledFor, amount: hoursSavedIncrements.amount })
    .from(hoursSavedIncrements)
    .where(
      and(
        eq(hoursSavedIncrements.stateId, state.id),
        gte(hoursSavedIncrements.scheduledFor, windowStart),
        lt(hoursSavedIncrements.scheduledFor, windowEnd),
      ),
    )
    .orderBy(asc(hoursSavedIncrements.scheduledFor));

  const aggregated = new Map<string, HoursSavedScheduleEntry>();

  for (const row of scheduleRows) {
    const hourStart = startOfHour(row.scheduledFor);
    const key = hourStart.toISOString();
    const existingEntry = aggregated.get(key);

    if (existingEntry) {
      existingEntry.amount += row.amount;
    } else {
      aggregated.set(key, {
        scheduledFor: hourStart,
        amount: row.amount,
      });
    }
  }

  const schedule: HoursSavedScheduleEntry[] = [];
  for (let offset = 0; offset < HOURS_SAVED_WINDOW_HOURS; offset += 1) {
    const hourStart = addHours(windowStart, offset);
    const key = hourStart.toISOString();
    const entry = aggregated.get(key);
    schedule.push({
      scheduledFor: hourStart,
      amount: entry?.amount ?? 0,
    });
  }

  const nextUpdateRow = scheduleRows.find((row) => row.scheduledFor.getTime() > now.getTime() && row.amount > 0);

  return {
    baseAmount: state.baseAmount,
    baseSetAt: state.baseSetAt,
    currentAmount: state.baseAmount + applied,
    nextUpdateAt: nextUpdateRow?.scheduledFor ?? null,
    schedule,
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
      const generatedValues = input.schedule.flatMap((entry) => {
        const hourStart = startOfHour(entry.scheduledFor);
        const normalizedAmount = Math.max(0, Math.round(entry.amount));
        const generated = generateRandomizedIncrements(normalizedAmount, hourStart);

        return generated.map((item) => ({
          stateId: state.id,
          scheduledFor: item.scheduledFor,
          amount: item.amount,
          updatedAt: new Date(),
        }));
      });

      if (generatedValues.length > 0) {
        await executor.insert(hoursSavedIncrements).values(generatedValues);
      }
    }

    await ensureUpcomingSchedule(executor, state.id, reference);
  });

  return getHoursSavedOverview(reference);
}
