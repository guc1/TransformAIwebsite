import { sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { visitorSessions } from "@/lib/db/schema";

export async function recordVisitorSession(
  visitorId: string,
): Promise<void> {
  try {
    await db
      .insert(visitorSessions)
      .values({ id: visitorId })
      .onConflictDoNothing();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to record visitor session", error);
    }
  }
}

type HourlyVisitorBucket = {
  start: Date;
  end: Date;
  count: number;
};

type DailyVisitorBucket = {
  day: Date;
  count: number;
};

export type VisitorOverview = {
  total: number;
  hourly: HourlyVisitorBucket[];
  daily: DailyVisitorBucket[];
};

function formatHourKey(date: Date): string {
  return date.toISOString().slice(0, 13);
}

function formatDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getVisitorOverview(): Promise<VisitorOverview> {
  const now = new Date();
  const hourAnchor = new Date(now);
  hourAnchor.setMinutes(0, 0, 0);

  const dayAnchor = new Date(hourAnchor);
  dayAnchor.setHours(0, 0, 0, 0);

  const [totalResult, hourlyResult, dailyResult] = await Promise.all([
    db.execute<{ count: number }>(
      sql`select count(*)::int as count from ${visitorSessions}`,
    ),
    db.execute<{ bucket: Date; total: number }>(
      sql`
        select
          date_trunc('hour', ${visitorSessions.createdAt}) as bucket,
          count(*)::int as total
        from ${visitorSessions}
        where ${visitorSessions.createdAt} >= now() - interval '24 hours'
        group by bucket
        order by bucket asc
      `,
    ),
    db.execute<{ bucket: Date; total: number }>(
      sql`
        select
          date_trunc('day', ${visitorSessions.createdAt}) as bucket,
          count(*)::int as total
        from ${visitorSessions}
        where ${visitorSessions.createdAt} >= now() - interval '7 days'
        group by bucket
        order by bucket asc
      `,
    ),
  ]);

  const total = Number(totalResult.rows.at(0)?.count ?? 0);

  const hourlyMap = new Map<string, number>();
  for (const row of hourlyResult.rows) {
    const bucket = new Date(row.bucket);
    hourlyMap.set(formatHourKey(bucket), Number(row.total));
  }

  const hourlyBuckets: HourlyVisitorBucket[] = [];
  for (let offset = 23; offset >= 0; offset -= 1) {
    const start = new Date(hourAnchor);
    start.setHours(hourAnchor.getHours() - offset);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    const key = formatHourKey(start);
    const count = hourlyMap.get(key) ?? 0;

    hourlyBuckets.push({ start, end, count });
  }

  const dailyMap = new Map<string, number>();
  for (const row of dailyResult.rows) {
    const bucket = new Date(row.bucket);
    dailyMap.set(formatDayKey(bucket), Number(row.total));
  }

  const dailyBuckets: DailyVisitorBucket[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(dayAnchor);
    day.setDate(dayAnchor.getDate() - offset);
    const key = formatDayKey(day);
    const count = dailyMap.get(key) ?? 0;

    dailyBuckets.push({ day, count });
  }

  return {
    total,
    hourly: hourlyBuckets,
    daily: dailyBuckets,
  };
}
