"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { updateHoursSavedSettings } from "@/lib/hours-saved";
import { HOURS_SAVED_WINDOW_HOURS } from "@/lib/hours-saved/constants";

const scheduleItemSchema = z.object({
  scheduledFor: z.string().datetime(),
  amount: z.number().int().min(0).max(1_000_000),
});

const manualPayloadSchema = z.object({
  mode: z.literal("manual"),
  baseAmount: z.number().int().min(0).max(1_000_000_000),
  schedule: z.array(scheduleItemSchema).length(HOURS_SAVED_WINDOW_HOURS),
  dailyTarget: z.number().int().min(0).max(1_000_000_000).optional(),
});

const autoPayloadSchema = z.object({
  mode: z.literal("auto"),
  baseAmount: z.number().int().min(0).max(1_000_000_000),
  dailyTarget: z.number().int().min(0).max(1_000_000_000),
});

const payloadSchema = z.discriminatedUnion("mode", [manualPayloadSchema, autoPayloadSchema]);

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

  try {
    if (parsed.data.mode === "manual") {
      const scheduleEntries = parsed.data.schedule
        .map((entry) => ({
          scheduledFor: new Date(entry.scheduledFor),
          amount: entry.amount,
        }))
        .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());

      await updateHoursSavedSettings({
        mode: "manual",
        baseAmount: parsed.data.baseAmount,
        schedule: scheduleEntries,
        dailyTarget: parsed.data.dailyTarget,
        now: reference,
      });
    } else {
      await updateHoursSavedSettings({
        mode: "auto",
        baseAmount: parsed.data.baseAmount,
        dailyTarget: parsed.data.dailyTarget,
        now: reference,
      });
    }
  } catch (error) {
    console.error("Failed to update hours saved schedule", error);
    return { success: false as const, error: "unknown" as const };
  }

  await revalidatePath(`/${locale}`);
  await revalidatePath(`/${locale}/dashboard`);
  await revalidatePath(`/${locale}/dashboard/hours-saved`);

  return { success: true as const };
}
