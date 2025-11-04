import { and, asc, eq, gte, lt, lte } from "drizzle-orm";

import { db, type DrizzleDB } from "@/lib/db/client";
import { hoursSavedIncrements, hoursSavedStates } from "@/lib/db/schema";

import {
  HOURS_SAVED_WINDOW_HOURS,
  HOURS_SAVED_ENTRIES_PER_HOUR,
  HOURS_SAVED_DEFAULT_DAILY_TARGET,
  addHours,
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
  dailyTarget: number;
  schedule: HoursSavedScheduleEntry[];
};

type DbExecutor = DrizzleDB;
type HoursSavedState = typeof hoursSavedStates.$inferSelect;

const HOURS_PER_DAY = 24;

function allocateIntegerTotal(total: number, buckets: number, minPerBucket = 0): number[] {
  if (buckets <= 0) {
    return [];
  }

  if (total <= 0) {
    return Array.from({ length: buckets }, () => 0);
  }

  const safeMin = Math.max(0, Math.floor(minPerBucket));
  const baseValues = Array.from({ length: buckets }, () => safeMin);
  let remainder = total - safeMin * buckets;

  if (remainder <= 0) {
    return baseValues;
  }

  const weights = Array.from({ length: buckets }, () => Math.random() + 0.001);
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const raw = weights.map((weight) => (weight / weightSum) * remainder);

  const result = baseValues.map((value, index) => value + Math.floor(raw[index]));
  let leftover = remainder - raw.reduce((sum, value) => sum + Math.floor(value), 0);

  const fractional = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  let pointer = 0;
  while (leftover > 0 && fractional.length > 0) {
    result[fractional[pointer].index] += 1;
    leftover -= 1;
    pointer = (pointer + 1) % fractional.length;
  }

  return result;
}

function splitAmountIntoIncrements(amount: number): number[] {
  const total = Math.max(0, Math.floor(amount));

  if (total === 0) {
    return [];
  }

  const incrementsCount = Math.min(total, HOURS_SAVED_ENTRIES_PER_HOUR);
  const increments = Array.from({ length: incrementsCount }, () => 1);
  let remainder = total - incrementsCount;

  while (remainder > 0 && increments.length > 0) {
    const index = Math.floor(Math.random() * increments.length);
    increments[index] += 1;
    remainder -= 1;
  }

  return increments;
}

function generateAutomaticSchedule({
  stateId,
  windowStart,
  windowHours,
  dailyTarget,
}: {
  stateId: string;
  windowStart: Date;
  windowHours: number;
  dailyTarget: number;
}): { stateId: string; scheduledFor: Date; amount: number }[] {
  if (windowHours <= 0) {
    return [];
  }

  const schedule: { stateId: string; scheduledFor: Date; amount: number }[] = [];
  const usedTimestamps = new Set<number>();
  const days = Math.ceil(windowHours / HOURS_PER_DAY);
  const safeTarget = Math.max(0, Math.floor(dailyTarget));

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    const dayStart = addHours(windowStart, dayIndex * HOURS_PER_DAY);
    const hoursRemaining = Math.min(HOURS_PER_DAY, windowHours - dayIndex * HOURS_PER_DAY);
    const hourAllocations = allocateIntegerTotal(
      safeTarget,
      HOURS_PER_DAY,
      safeTarget >= HOURS_PER_DAY ? 1 : 0,
    );

    for (let hourOffset = 0; hourOffset < hoursRemaining; hourOffset += 1) {
      const hourAmount = hourAllocations[hourOffset] ?? 0;

      if (hourAmount <= 0) {
        continue;
      }

      const increments = splitAmountIntoIncrements(hourAmount);
      const hourStart = addHours(dayStart, hourOffset);

      for (const increment of increments) {
        if (increment <= 0) {
          continue;
        }

        const scheduledFor = randomizeWithinHour(hourStart, usedTimestamps);
        schedule.push({ stateId, scheduledFor, amount: increment });
      }
    }
  }

  return schedule;
}

function expandHourlySchedule(
  stateId: string,
  schedule: HoursSavedScheduleEntry[],
): { stateId: string; scheduledFor: Date; amount: number }[] {
  const usedTimestamps = new Set<number>();
  const values: { stateId: string; scheduledFor: Date; amount: number }[] = [];

  for (const entry of schedule) {
    const amount = Math.max(0, Math.floor(entry.amount));

    if (amount <= 0) {
      continue;
    }

    const hourStart = startOfHour(entry.scheduledFor);
    const increments = splitAmountIntoIncrements(amount);

    for (const increment of increments) {
      if (increment <= 0) {
        continue;
      }

      const scheduledFor = randomizeWithinHour(hourStart, usedTimestamps);
      values.push({ stateId, scheduledFor, amount: increment });
    }
  }

  return values;
}

async function ensureState(executor: DbExecutor = db) {
  const existing = await executor.query.hoursSavedStates.findFirst();

  if (existing) {
    if (existing.autoDailyTarget == null) {
      const updated = await executor
        .update(hoursSavedStates)
        .set({
          autoDailyTarget: HOURS_SAVED_DEFAULT_DAILY_TARGET,
          updatedAt: new Date(),
        })
        .where(eq(hoursSavedStates.id, existing.id))
        .returning()
        .then((rows) => rows[0]);

      if (updated) {
        return updated;
      }

      return {
        ...existing,
        autoDailyTarget: HOURS_SAVED_DEFAULT_DAILY_TARGET,
      } satisfies HoursSavedState;
    }

    return existing;
  }

  const [created] = await executor
    .insert(hoursSavedStates)
    .values({
      baseAmount: 0,
      baseSetAt: new Date(),
      autoDailyTarget: HOURS_SAVED_DEFAULT_DAILY_TARGET,
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
  state: HoursSavedState,
  now: Date,
) {
  const windowStart = nextHour(now);
  const windowEnd = addHours(windowStart, HOURS_SAVED_WINDOW_HOURS);

  const existing = await executor
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
    );

  const coverage = new Map<string, { count: number; total: number }>();
  for (const entry of existing) {
    const hourKey = startOfHour(entry.scheduledFor).toISOString();
    const current = coverage.get(hourKey);

    if (current) {
      current.count += 1;
      current.total += entry.amount;
    } else {
      coverage.set(hourKey, { count: 1, total: entry.amount });
    }
  }

  let needsRegeneration = existing.length === 0;

  if (!needsRegeneration) {
    for (let offset = 0; offset < HOURS_SAVED_WINDOW_HOURS; offset += 1) {
      const hourStart = addHours(windowStart, offset);
      const hourKey = hourStart.toISOString();
      const data = coverage.get(hourKey);

      if (!data || data.total <= 0) {
        continue;
      }

      const expected = Math.min(
        HOURS_SAVED_ENTRIES_PER_HOUR,
        Math.max(1, Math.min(data.total, HOURS_SAVED_ENTRIES_PER_HOUR)),
      );

      if (data.count < expected) {
        needsRegeneration = true;
        break;
      }
    }
  }

  if (!needsRegeneration) {
    return;
  }

  await executor
    .delete(hoursSavedIncrements)
    .where(
      and(
        eq(hoursSavedIncrements.stateId, state.id),
        gte(hoursSavedIncrements.scheduledFor, windowStart),
        lt(hoursSavedIncrements.scheduledFor, windowEnd),
      ),
    );

  const autoTarget = state.autoDailyTarget ?? HOURS_SAVED_DEFAULT_DAILY_TARGET;
  const values = generateAutomaticSchedule({
    stateId: state.id,
    windowStart,
    windowHours: HOURS_SAVED_WINDOW_HOURS,
    dailyTarget: autoTarget,
  });

  if (values.length > 0) {
    await executor.insert(hoursSavedIncrements).values(values);
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

  await ensureUpcomingSchedule(db, state, now);

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

  const aggregatedByHour = new Map<string, HoursSavedScheduleEntry>();

  for (const row of scheduleRows) {
    const hourStart = startOfHour(row.scheduledFor);
    const hourKey = hourStart.toISOString();
    const existingEntry = aggregatedByHour.get(hourKey);

    if (existingEntry) {
      existingEntry.amount += row.amount;
      continue;
    }

    aggregatedByHour.set(hourKey, {
      scheduledFor: hourStart,
      amount: row.amount,
    });
  }

  const scheduleEntries = Array.from(aggregatedByHour.values())
    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
    .slice(0, HOURS_SAVED_WINDOW_HOURS);

  const nextUpdateAt = scheduleRows[0]?.scheduledFor ?? null;

  return {
    baseAmount: state.baseAmount,
    baseSetAt: state.baseSetAt,
    currentAmount: state.baseAmount + applied,
    nextUpdateAt,
    dailyTarget: state.autoDailyTarget ?? HOURS_SAVED_DEFAULT_DAILY_TARGET,
    schedule: scheduleEntries,
  };
}

type ManualHoursSavedInput = {
  mode: "manual";
  baseAmount: number;
  schedule: HoursSavedScheduleEntry[];
  now?: Date;
  dailyTarget?: number;
};

type AutoHoursSavedInput = {
  mode: "auto";
  baseAmount: number;
  dailyTarget: number;
  now?: Date;
};

export async function updateHoursSavedSettings(
  input: ManualHoursSavedInput | AutoHoursSavedInput,
): Promise<HoursSavedOverview> {
  const reference = input.now ?? new Date();

  await db.transaction(async (tx) => {
    const executor = tx as unknown as DbExecutor;
    let state = await ensureState(executor);

    const baseSetAt = reference;
    const stateUpdate: Partial<typeof hoursSavedStates.$inferInsert> = {
      baseAmount: input.baseAmount,
      baseSetAt,
      updatedAt: new Date(),
    };

    if (input.mode === "auto") {
      stateUpdate.autoDailyTarget = input.dailyTarget;
      state = { ...state, autoDailyTarget: input.dailyTarget } as HoursSavedState;
    } else if (input.dailyTarget !== undefined) {
      stateUpdate.autoDailyTarget = input.dailyTarget;
      state = { ...state, autoDailyTarget: input.dailyTarget } as HoursSavedState;
    }

    await executor
      .update(hoursSavedStates)
      .set(stateUpdate)
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

    let values: { stateId: string; scheduledFor: Date; amount: number }[] = [];

    if (input.mode === "manual") {
      const sortedSchedule = [...input.schedule]
        .map((entry) => ({
          scheduledFor: new Date(entry.scheduledFor),
          amount: entry.amount,
        }))
        .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
        .filter(
          (entry) =>
            entry.scheduledFor.getTime() >= windowStart.getTime() &&
            entry.scheduledFor.getTime() < windowEnd.getTime(),
        );

      values = expandHourlySchedule(state.id, sortedSchedule);
    } else {
      const target = state.autoDailyTarget ?? input.dailyTarget;
      values = generateAutomaticSchedule({
        stateId: state.id,
        windowStart,
        windowHours: HOURS_SAVED_WINDOW_HOURS,
        dailyTarget: target,
      });
    }

    if (values.length > 0) {
      const timestamp = new Date();
      await executor.insert(hoursSavedIncrements).values(
        values.map((value) => ({
          ...value,
          updatedAt: timestamp,
        })),
      );
    }

    await ensureUpcomingSchedule(executor, state, reference);
  });

  return getHoursSavedOverview(reference);
}
