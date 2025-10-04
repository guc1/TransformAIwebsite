import { unstable_noStore as noStore } from "next/cache";

import { db } from "@/lib/db/client";
import { outreachPages } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

import { toOutreachSlug } from "./slug";

export interface OutreachPageRecord {
  id: string;
  slug: string;
  displayName: string;
  displayText: string;
  templateId: number;
  bookedMeeting: boolean;
  bookedMeetingAt: Date | null;
  visitCount: number;
  firstVisitedAt: Date | null;
  lastVisitedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedOutreachPageRecord
  extends Omit<OutreachPageRecord, "firstVisitedAt" | "lastVisitedAt" | "bookedMeetingAt" | "createdAt" | "updatedAt"> {
  firstVisitedAt: string | null;
  lastVisitedAt: string | null;
  bookedMeetingAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ImportEntry {
  name: string;
  text: string;
  templateId: number;
}

interface ImportResult {
  created: number;
  updated: number;
  slugs: string[];
}

export async function listOutreachPages(): Promise<OutreachPageRecord[]> {
  noStore();

  const rows = await db.query.outreachPages.findMany({
    orderBy: [desc(outreachPages.createdAt)],
  });

  return rows.map((row) => ({
    ...row,
    bookedMeetingAt: row.bookedMeetingAt ?? null,
    firstVisitedAt: row.firstVisitedAt ?? null,
    lastVisitedAt: row.lastVisitedAt ?? null,
  }));
}

export async function getOutreachPageBySlug(
  slug: string,
): Promise<OutreachPageRecord | null> {
  noStore();

  const row = await db.query.outreachPages.findFirst({
    where: eq(outreachPages.slug, slug),
  });

  if (!row) {
    return null;
  }

  return {
    ...row,
    bookedMeetingAt: row.bookedMeetingAt ?? null,
    firstVisitedAt: row.firstVisitedAt ?? null,
    lastVisitedAt: row.lastVisitedAt ?? null,
  };
}

export async function recordOutreachVisit(
  slug: string,
): Promise<OutreachPageRecord | null> {
  const existing = await getOutreachPageBySlug(slug);

  if (!existing) {
    return null;
  }

  const now = new Date();
  const firstVisitedAt = existing.firstVisitedAt ?? now;

  const [updated] = await db
    .update(outreachPages)
    .set({
      firstVisitedAt,
      lastVisitedAt: now,
      visitCount: existing.visitCount + 1,
      updatedAt: now,
    })
    .where(eq(outreachPages.id, existing.id))
    .returning();

  const record = updated ?? {
    ...existing,
    bookedMeetingAt: existing.bookedMeetingAt,
    firstVisitedAt,
    lastVisitedAt: now,
    visitCount: existing.visitCount + 1,
    updatedAt: now,
  };

  return {
    ...record,
    bookedMeetingAt: record.bookedMeetingAt ?? null,
    firstVisitedAt: record.firstVisitedAt ?? null,
    lastVisitedAt: record.lastVisitedAt ?? null,
  };
}

export async function importOutreachEntries(entries: ImportEntry[]): Promise<ImportResult> {
  noStore();

  const cleaned = entries
    .map((entry) => ({
      name: entry.name.trim(),
      text: entry.text.trim(),
      templateId: entry.templateId,
    }))
    .filter((entry) => entry.name.length > 0 && entry.text.length > 0);

  const deduped = new Map<string, ImportEntry>();

  for (const entry of cleaned) {
    const slug = toOutreachSlug(entry.name);

    if (!slug) {
      continue;
    }

    deduped.set(slug, entry);
  }

  const uniqueEntries = Array.from(deduped.entries()).map(([slug, entry]) => ({
    slug,
    name: entry.name,
    text: entry.text,
    templateId: entry.templateId,
  }));

  if (uniqueEntries.length === 0) {
    return { created: 0, updated: 0, slugs: [] };
  }

  const slugList = uniqueEntries.map((entry) => entry.slug);
  const existingRows = slugList.length
    ? await db
        .select({ slug: outreachPages.slug })
        .from(outreachPages)
        .where(inArray(outreachPages.slug, slugList))
    : [];

  const existingSet = new Set(existingRows.map((row) => row.slug));
  const now = new Date();

  for (const entry of uniqueEntries) {
    await db
      .insert(outreachPages)
      .values({
        slug: entry.slug,
        displayName: entry.name,
        displayText: entry.text,
        templateId: entry.templateId,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: outreachPages.slug,
        set: {
          displayName: entry.name,
          displayText: entry.text,
          templateId: entry.templateId,
          updatedAt: now,
        },
      });
  }

  const created = uniqueEntries.filter((entry) => !existingSet.has(entry.slug)).length;
  const updated = uniqueEntries.length - created;

  return { created, updated, slugs: slugList };
}

export function serializeOutreachPages(
  pages: OutreachPageRecord[],
): SerializedOutreachPageRecord[] {
  return pages.map((page) => ({
    ...page,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
    firstVisitedAt: page.firstVisitedAt ? page.firstVisitedAt.toISOString() : null,
    lastVisitedAt: page.lastVisitedAt ? page.lastVisitedAt.toISOString() : null,
    bookedMeetingAt: page.bookedMeetingAt ? page.bookedMeetingAt.toISOString() : null,
  }));
}

export async function deleteOutreachPage(slug: string): Promise<boolean> {
  const result = await db
    .delete(outreachPages)
    .where(eq(outreachPages.slug, slug))
    .returning({ id: outreachPages.id });

  return result.length > 0;
}
