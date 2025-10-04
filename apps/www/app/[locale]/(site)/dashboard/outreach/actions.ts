"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import {
  importOutreachEntries,
  listOutreachPages,
  serializeOutreachPages,
} from "@/lib/outreach";

const entrySchema = z.object({
  name: z.string().min(1).max(200),
  text: z.string().min(1).max(4000),
});

export async function importOutreachEntriesAction(locale: string, payload: unknown) {
  const session = await getAuthSession();

  if (session?.user?.role !== "staff") {
    return { success: false as const, error: "unauthorized" as const };
  }

  const parsed = z.array(entrySchema).min(1).safeParse(payload);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation" as const,
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await importOutreachEntries(parsed.data);
    const pages = await listOutreachPages();

    await revalidatePath(`/${locale}/dashboard`);
    await revalidatePath(`/${locale}/dashboard/outreach`);

    for (const slug of result.slugs) {
      await revalidatePath(`/${locale}/outreach/${slug}`);
    }

    return {
      success: true as const,
      created: result.created,
      updated: result.updated,
      pages: serializeOutreachPages(pages),
    };
  } catch (error) {
    console.error("Failed to import outreach entries", error);
    return { success: false as const, error: "unknown" as const };
  }
}
