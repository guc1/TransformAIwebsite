import { NextResponse } from "next/server";

import { getHoursSavedSummary } from "@/lib/hours-saved";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getHoursSavedSummary();

    return NextResponse.json({
      total: summary.total,
      updatedAt: summary.lastAppliedAt.toISOString(),
      nextUpdateAt: summary.nextUpdateAt ? summary.nextUpdateAt.toISOString() : null,
    });
  } catch (error) {
    console.error("Failed to load hours saved summary", error);
    return NextResponse.json({ error: "Unable to load hours saved." }, { status: 500 });
  }
}
