"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { updateHoursSavedSettings } from "@/lib/hours-saved";
import {
  HOURS_SAVED_WINDOW_HOURS,
  addHours,
  nextHour,
  randomizeWithinHour,
} from "@/lib/hours-saved/constants";

const scheduleItemSchema = z.object({
  scheduledFor: z.string().datetime(),
  amount: z.number().int().min(0).max(1_000_000),
});

const payloadSchema = z.object({
  baseAmount: z.number().int().min(0).max(1_000_000_000),
  schedule: z.array(scheduleItemSchema).length(HOURS_SAVED_WINDOW_HOURS),
});

export async function updateHoursSavedScheduleAction(locale: string, payload: unknown) {
  const session = await getAuthSession();

  if (session?.user?.role !== "staff") {
    return { success: false as const, error: "unauthorized" as const };
  }

  const parsed = payloadSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation" as const,
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const reference = new Date();
  const windowStart = nextHour(reference);

  const sortedEntries = parsed.data.schedule
    .map((entry) => ({
      scheduledFor: new Date(entry.scheduledFor),
      amount: entry.amount,
    }))
    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());

  const usedTimestamps = new Set<number>();
  const normalizedSchedule = sortedEntries.map((entry, index) => {
    const hourStart = addHours(windowStart, index);
    const scheduledFor = randomizeWithinHour(hourStart, usedTimestamps);
    return {
      scheduledFor,
      amount: entry.amount,
    };
  });

  try {
    await updateHoursSavedSettings({
      baseAmount: parsed.data.baseAmount,
      schedule: normalizedSchedule,
      now: reference,
    });
  } catch (error) {
    console.error("Failed to update hours saved schedule", error);
    return { success: false as const, error: "unknown" as const };
  }

  await revalidatePath(`/${locale}`);
  await revalidatePath(`/${locale}/dashboard`);
  await revalidatePath(`/${locale}/dashboard/hours-saved`);

  return { success: true as const };
}
