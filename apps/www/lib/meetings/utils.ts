import { addDays } from "date-fns";

import { MEETING_DAY_RANGE, MEETING_TIME_ZONE } from "./constants";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: MEETING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const fullFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: MEETING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

type DayBounds = {
  startMs: number;
  length: number;
};

const dayBoundsCache = new Map<string, DayBounds>();

function getPartValue(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
  fallback = 0,
): number {
  const match = parts.find((part) => part.type === type);
  return match ? Number(match.value) : fallback;
}

function computeDayStart(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  let guess = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0));

  for (let index = 0; index < 6; index += 1) {
    const parts = fullFormatter.formatToParts(guess);
    const partYear = getPartValue(parts, "year", year ?? guess.getUTCFullYear());
    const partMonth = getPartValue(parts, "month", month ?? guess.getUTCMonth() + 1);
    const partDay = getPartValue(parts, "day", day ?? guess.getUTCDate());
    const partHour = getPartValue(parts, "hour");
    const partMinute = getPartValue(parts, "minute");
    const partSecond = getPartValue(parts, "second");

    const localUtcMs = Date.UTC(
      partYear,
      (partMonth ?? 1) - 1,
      partDay ?? 1,
      partHour,
      partMinute,
      partSecond,
    );
    const targetUtcMs = Date.UTC(year ?? partYear, (month ?? 1) - 1, day ?? 1, 0, 0, 0);
    const diff = localUtcMs - targetUtcMs;

    if (Math.abs(diff) <= 30_000) {
      break;
    }

    guess = new Date(guess.getTime() - diff);
  }

  return guess.getTime();
}

function getDayBounds(dateKey: string): DayBounds {
  let cached = dayBoundsCache.get(dateKey);

  if (!cached) {
    const startMs = computeDayStart(dateKey);
    const nextDateKey = getMeetingDateKey(
      addDays(getDateFromMeetingKey(dateKey), 1),
    );
    const nextStartMs = computeDayStart(nextDateKey);
    const length = Math.max(
      1,
      Math.round((nextStartMs - startMs) / 60_000),
    );

    cached = { startMs, length } satisfies DayBounds;
    dayBoundsCache.set(dateKey, cached);
  }

  return cached;
}

export function getMeetingDateKey(date: Date): string {
  return dayFormatter.format(date);
}

export function getDateFromMeetingKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

export function createMeetingDayRange(
  start: Date,
  days: number = MEETING_DAY_RANGE,
): { date: Date; dateKey: string }[] {
  const normalizedStart = getDateFromMeetingKey(getMeetingDateKey(start));
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(normalizedStart, index);
    return { date, dateKey: getMeetingDateKey(date) };
  });
}

export function getMeetingDayLengthMinutes(dateKey: string): number {
  return getDayBounds(dateKey).length;
}

export function getMeetingMinutesFromIso(iso: string): number {
  const date = new Date(iso);
  const dateKey = getMeetingDateKey(date);
  const { startMs } = getDayBounds(dateKey);
  return Math.round((date.getTime() - startMs) / 60_000);
}

export function meetingMinutesToIso(dateKey: string, minutes: number): string {
  const { startMs, length } = getDayBounds(dateKey);
  const clamped = Math.min(Math.max(Math.round(minutes), 0), length);
  const instant = new Date(startMs + clamped * 60_000);
  return instant.toISOString();
}
