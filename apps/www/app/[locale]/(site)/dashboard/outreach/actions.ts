"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import {
  deleteOutreachPage,
  deleteOutreachPages,
  importOutreachEntries,
  listOutreachPages,
  serializeOutreachPages,
} from "@/lib/outreach";
import { locales } from "@/i18n/routing";

const entrySchema = z.object({
  name: z.string().min(1).max(200),
  text: z.string().min(1).max(4000),
  templateId: z.number().int().min(1).max(50),
  campaign: z.string().regex(/^[A-Z]{3}$/),
  sub: z.string().regex(/^[A-Z]{2}[0-9]$/),
});

const deleteSchema = z.object({
  slug: z.string().min(1).max(160),
});

const deleteManySchema = z.object({
  slugs: z.array(z.string().min(1).max(160)).min(1),
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
      await revalidatePath(`/outreach/${slug}`);
      for (const localeCode of locales) {
        await revalidatePath(`/${localeCode}/outreach/${slug}`);
      }
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

export async function deleteOutreachPageAction(locale: string, payload: unknown) {
  const session = await getAuthSession();

  if (session?.user?.role !== "staff") {
    return { success: false as const, error: "unauthorized" as const };
  }

  const parsed = deleteSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation" as const,
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const deleted = await deleteOutreachPage(parsed.data.slug);

  if (!deleted) {
    return { success: false as const, error: "not_found" as const };
  }

  const pages = await listOutreachPages();

  await revalidatePath(`/${locale}/dashboard`);
  await revalidatePath(`/${locale}/dashboard/outreach`);
  await revalidatePath(`/outreach/${parsed.data.slug}`);
  for (const localeCode of locales) {
    await revalidatePath(`/${localeCode}/outreach/${parsed.data.slug}`);
  }

  return {
    success: true as const,
    pages: serializeOutreachPages(pages),
  };
}

export async function deleteOutreachPagesAction(locale: string, payload: unknown) {
  const session = await getAuthSession();

  if (session?.user?.role !== "staff") {
    return { success: false as const, error: "unauthorized" as const };
  }

  const parsed = deleteManySchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation" as const,
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const deletedCount = await deleteOutreachPages(parsed.data.slugs);

  if (deletedCount === 0) {
    return { success: false as const, error: "not_found" as const };
  }

  const pages = await listOutreachPages();

  await revalidatePath(`/${locale}/dashboard`);
  await revalidatePath(`/${locale}/dashboard/outreach`);

  for (const slug of parsed.data.slugs) {
    await revalidatePath(`/outreach/${slug}`);
    for (const localeCode of locales) {
      await revalidatePath(`/${localeCode}/outreach/${slug}`);
    }
  }

  return {
    success: true as const,
    deleted: deletedCount,
    pages: serializeOutreachPages(pages),
  };
}
