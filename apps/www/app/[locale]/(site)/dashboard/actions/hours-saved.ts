"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import {
  regenerateHoursSavedPlan,
  saveHoursSavedSettings,
  updateHoursSavedAdjustment,
} from "@/lib/hours-saved";

const settingsSchema = z.object({
  baseAmount: z.coerce.number().min(0).max(1_000_000_000),
  dayIncrement: z.coerce.number().min(0).max(1_000_000),
  nightIncrement: z.coerce.number().min(0).max(1_000_000),
  locale: z.string().min(2).max(10),
});

const regenerateSchema = z.object({
  locale: z.string().min(2).max(10),
});

const adjustmentSchema = z.object({
  id: z.string().min(1),
  amount: z.coerce.number().min(0).max(1_000_000),
  locale: z.string().min(2).max(10),
});

async function assertStaffRole() {
  const session = await getAuthSession();
  if (session?.user?.role !== "staff") {
    throw new Error("Unauthorized");
  }
}

export async function updateHoursSavedSettingsAction(formData: FormData) {
  await assertStaffRole();
  const parsed = settingsSchema.parse({
    baseAmount: formData.get("baseAmount"),
    dayIncrement: formData.get("dayIncrement"),
    nightIncrement: formData.get("nightIncrement"),
    locale: formData.get("locale"),
  });

  await saveHoursSavedSettings({
    baseAmount: parsed.baseAmount,
    dayIncrement: parsed.dayIncrement,
    nightIncrement: parsed.nightIncrement,
  });

  revalidatePath(`/${parsed.locale}/dashboard`);
}

export async function regenerateHoursSavedPlanAction(formData: FormData) {
  await assertStaffRole();
  const parsed = regenerateSchema.parse({
    locale: formData.get("locale"),
  });

  await regenerateHoursSavedPlan();

  revalidatePath(`/${parsed.locale}/dashboard`);
}

export async function updateHoursSavedAdjustmentAction(formData: FormData) {
  await assertStaffRole();
  const parsed = adjustmentSchema.parse({
    id: formData.get("id"),
    amount: formData.get("amount"),
    locale: formData.get("locale"),
  });

  await updateHoursSavedAdjustment({ id: parsed.id, amount: parsed.amount });

  revalidatePath(`/${parsed.locale}/dashboard`);
}
