import { locales } from "@/i18n/routing";

export const ACCOUNT_HISTORY_COOKIE = "transformai_recent_accounts";
export const ACCOUNT_HISTORY_EVENT = "transformai:account-history-updated";
export const ACCOUNT_HISTORY_MAX_ENTRIES = 3;

const DEFAULT_DESTINATIONS: Record<"client" | "staff", string> = {
  client: "/newsupdates",
  staff: "/dashboard",
};

export type AccountHistoryEntry = {
  id: string;
  email: string;
  name?: string | null;
  role: "client" | "staff";
  lastActiveAt: string;
  destination: string;
};

export type AccountHistoryInput = Omit<AccountHistoryEntry, "lastActiveAt" | "destination"> & {
  lastActiveAt?: string;
  destination?: string;
};

type RawAccountHistoryEntry = Partial<AccountHistoryInput> & {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  lastActiveAt?: string | null;
  destination?: string | null;
};

function getDefaultDestination(role: "client" | "staff") {
  return DEFAULT_DESTINATIONS[role] ?? DEFAULT_DESTINATIONS.client;
}

function stripLocalePrefix(path: string) {
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (path === prefix) {
      return "/";
    }
    if (path.startsWith(`${prefix}/`)) {
      return path.slice(prefix.length) || "/";
    }
  }
  return path;
}

function normalizeDestination(destination: unknown, role: "client" | "staff") {
  const fallback = getDefaultDestination(role);

  if (typeof destination !== "string") {
    return fallback;
  }

  const trimmed = destination.trim();

  if (!trimmed) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "https://transform.ai");
    const basePath = parsed.pathname.startsWith("/")
      ? parsed.pathname
      : `/${parsed.pathname}`;
    const strippedPath = stripLocalePrefix(basePath);
    const normalizedPath = strippedPath.startsWith("/") ? strippedPath : `/${strippedPath}`;
    const finalPath = normalizedPath === "/" ? fallback : normalizedPath;
    const href = `${finalPath}${parsed.search}${parsed.hash}`;
    return href || fallback;
  } catch {
    const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const strippedPath = stripLocalePrefix(normalizedPath);
    if (!strippedPath || strippedPath === "/") {
      return fallback;
    }
    return strippedPath.startsWith("/") ? strippedPath : `/${strippedPath}`;
  }
}

function readCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const prefix = `${name}=`;
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }
  return undefined;
}

function writeCookieValue(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") {
    return;
  }

  const sameSite = "SameSite=Lax";
  const path = "path=/";
  document.cookie = `${name}=${encodeURIComponent(value)}; ${path}; Max-Age=${maxAgeSeconds}; ${sameSite}`;
}

function sanitizeEntries(entries: RawAccountHistoryEntry[]): AccountHistoryEntry[] {
  return entries
    .filter((entry) => {
      const email = entry?.email?.trim();
      const id = entry?.id?.trim() || email;
      return Boolean(id) && Boolean(email);
    })
    .map((entry) => {
      const email = (entry.email ?? "").trim();
      const id = (entry.id ?? email).trim();
      const role: "client" | "staff" = entry.role === "staff" ? "staff" : "client";
      const destination = normalizeDestination(entry.destination, role);

      return {
        id,
        email,
        name: entry.name ?? null,
        role,
        lastActiveAt: entry.lastActiveAt ?? new Date(0).toISOString(),
        destination,
      };
    })
    .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime())
    .slice(0, ACCOUNT_HISTORY_MAX_ENTRIES);
}

export function parseAccountHistory(raw?: string): AccountHistoryEntry[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sanitizeEntries(parsed as RawAccountHistoryEntry[]);
  } catch {
    return [];
  }
}

export function getAccountHistoryFromDocument(): AccountHistoryEntry[] {
  const raw = readCookieValue(ACCOUNT_HISTORY_COOKIE);
  return parseAccountHistory(raw);
}

export function rememberAccount(entry: AccountHistoryInput) {
  if (typeof document === "undefined") {
    return;
  }

  const existing = getAccountHistoryFromDocument();
  const now = entry.lastActiveAt ?? new Date().toISOString();
  const normalizedId = entry.id || entry.email.toLowerCase();

  const filtered = existing.filter((account) => {
    const accountId = account.id || account.email.toLowerCase();
    return accountId !== normalizedId;
  });

  const nextEntries: AccountHistoryEntry[] = sanitizeEntries([
    { ...entry, lastActiveAt: now },
    ...filtered,
  ]);

  writeCookieValue(
    ACCOUNT_HISTORY_COOKIE,
    JSON.stringify(nextEntries),
    60 * 60 * 24 * 30,
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ACCOUNT_HISTORY_EVENT));
  }
}

export function resolveAccountDestination(
  entry: Pick<AccountHistoryEntry, "role" | "destination"> & { destination?: string | null },
) {
  return normalizeDestination(entry.destination, entry.role);
}
