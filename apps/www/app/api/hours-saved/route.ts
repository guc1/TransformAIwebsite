import { NextResponse } from "next/server";

import { getHoursSavedOverview } from "@/lib/hours-saved";

export async function GET() {
  try {
    const overview = await getHoursSavedOverview();

    return NextResponse.json(
      {
        baseAmount: overview.baseAmount,
        baseSetAt: overview.baseSetAt.toISOString(),
        currentAmount: overview.currentAmount,
        nextUpdateAt: overview.nextUpdateAt ? overview.nextUpdateAt.toISOString() : null,
        schedule: overview.schedule.map((entry) => ({
          scheduledFor: entry.scheduledFor.toISOString(),
          amount: entry.amount,
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load hours saved overview", error);
    return NextResponse.json(
      { error: "internal_error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
