export type Burst = {
  offsetMs: number;
  value: number;
};

const START_DATE_UTC_MS = Date.UTC(2025, 8, 23); // 23 September 2025 UTC
const BASE_TOTAL = 100_000;
const DAILY_CAP_BASE = 1_000;
const DAILY_GROWTH = 1.01;
const MS_PER_DAY = 86_400_000;
const STORAGE_KEY = "ta.hoursSaved.v1";

const scheduleCache = new Map<number, Burst[]>();
const cumulativeCapsCache = new Map<number, number>([[0, 0]]);
let highestCachedDay = 0;

function formatDayKey(dayIndex: number): string {
  const date = new Date(START_DATE_UTC_MS + dayIndex * MS_PER_DAY);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function seededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    const t = (h >>> 0) + 0.5;
    return t / 4294967296;
  };
}

export function getDaysSinceStart(nowUTC: Date): number {
  if (!Number.isFinite(nowUTC.getTime())) {
    return 0;
  }
  const startOfDay = Date.UTC(
    nowUTC.getUTCFullYear(),
    nowUTC.getUTCMonth(),
    nowUTC.getUTCDate(),
  );
  const diff = startOfDay - START_DATE_UTC_MS;
  return Math.floor(diff / MS_PER_DAY);
}

export function dailyCap(dayIndex: number): number {
  if (dayIndex < 0) {
    return 0;
  }
  const cap = DAILY_CAP_BASE * Math.pow(DAILY_GROWTH, dayIndex);
  return Math.round(cap);
}

function cumulativeCapsUntil(dayIndexExclusive: number): number {
  if (dayIndexExclusive <= 0) {
    return 0;
  }
  if (cumulativeCapsCache.has(dayIndexExclusive)) {
    return cumulativeCapsCache.get(dayIndexExclusive)!;
  }

  let total = cumulativeCapsCache.get(highestCachedDay) ?? 0;
  let start = highestCachedDay;

  if (dayIndexExclusive < highestCachedDay) {
    // If we already computed beyond this day, return cached value directly.
    return cumulativeCapsCache.get(dayIndexExclusive) ?? 0;
  }

  for (let d = start; d < dayIndexExclusive; d++) {
    const nextIndex = d + 1;
    total += dailyCap(d);
    cumulativeCapsCache.set(nextIndex, total);
  }

  highestCachedDay = Math.max(highestCachedDay, dayIndexExclusive);
  return total;
}

export function getDailyScheduleUTC(dayIndex: number): Burst[] {
  if (dayIndex < 0) {
    return [];
  }

  if (scheduleCache.has(dayIndex)) {
    return scheduleCache.get(dayIndex)!;
  }

  const cap = dailyCap(dayIndex);
  if (cap <= 0) {
    scheduleCache.set(dayIndex, []);
    return [];
  }

  const seed = `hours-saved-${formatDayKey(dayIndex)}`;
  const rng = seededRng(seed);
  const burstCount = 20 + Math.floor(rng() * 21); // 20-40 bursts inclusive

  const offsets = Array.from({ length: burstCount }, () =>
    Math.floor(rng() * MS_PER_DAY),
  );

  const weights = Array.from({ length: burstCount }, () => rng() + 0.01);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const rawAllocations = weights.map((weight) => (weight / weightSum) * cap);
  const values = rawAllocations.map((allocation) => Math.floor(allocation));

  let remainder = cap - values.reduce((sum, value) => sum + value, 0);
  if (remainder > 0) {
    const fractions = rawAllocations.map((value, index) => ({
      index,
      fraction: value - values[index],
    }));

    fractions.sort((a, b) => {
      if (b.fraction === a.fraction) {
        return a.index - b.index;
      }
      return b.fraction - a.fraction;
    });

    let pointer = 0;
    while (remainder > 0) {
      const target = fractions[pointer % fractions.length];
      values[target.index] += 1;
      pointer += 1;
      remainder -= 1;
    }
  }

  if (cap > 0) {
    let zeroIndex = values.findIndex((value) => value === 0);
    while (zeroIndex !== -1) {
      const donor = values
        .map((value, index) => ({ value, index }))
        .filter((entry) => entry.value > 1)
        .sort((a, b) => {
          if (b.value === a.value) {
            return a.index - b.index;
          }
          return b.value - a.value;
        })[0];

      if (!donor) {
        break;
      }

      values[donor.index] -= 1;
      values[zeroIndex] = 1;
      zeroIndex = values.findIndex((value) => value === 0);
    }
  }

  const bursts = offsets.map((offset, index) => ({
    offsetMs: offset,
    value: values[index],
  }));

  bursts.sort((a, b) => a.offsetMs - b.offsetMs);
  scheduleCache.set(dayIndex, bursts);
  return bursts;
}

export function totalHoursUTC(nowUTC: Date): number {
  const timestamp = nowUTC.getTime();
  if (!Number.isFinite(timestamp)) {
    return BASE_TOTAL;
  }

  if (timestamp <= START_DATE_UTC_MS) {
    return BASE_TOTAL;
  }

  const diff = timestamp - START_DATE_UTC_MS;
  const dayIndex = Math.floor(diff / MS_PER_DAY);
  const startOfCurrentDay = START_DATE_UTC_MS + dayIndex * MS_PER_DAY;
  const elapsedToday = Math.max(0, timestamp - startOfCurrentDay);

  let total = BASE_TOTAL + cumulativeCapsUntil(dayIndex);

  if (elapsedToday >= MS_PER_DAY) {
    return total + dailyCap(dayIndex);
  }

  const schedule = getDailyScheduleUTC(dayIndex);
  for (const burst of schedule) {
    if (burst.offsetMs <= elapsedToday) {
      total += burst.value;
    } else {
      break;
    }
  }

  return total;
}

export function formatInt(value: number, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  });

  return formatter.format(Math.max(0, Math.round(value)));
}

export function getStorageKey(): string {
  return STORAGE_KEY;
}
