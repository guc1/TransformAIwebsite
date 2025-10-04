export const ACCOUNT_HISTORY_COOKIE = "transformai_recent_accounts";
export const ACCOUNT_HISTORY_EVENT = "transformai:account-history-updated";
export const ACCOUNT_HISTORY_MAX_ENTRIES = 3;

export type AccountHistoryEntry = {
  id: string;
  email: string;
  name?: string | null;
  role: "client" | "staff";
  lastActiveAt: string;
};

export type AccountHistoryInput = Omit<AccountHistoryEntry, "lastActiveAt"> & {
  lastActiveAt?: string;
};

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

function sanitizeEntries(entries: AccountHistoryEntry[]): AccountHistoryEntry[] {
  return entries
    .filter((entry) => Boolean(entry?.id) && Boolean(entry?.email))
    .map<AccountHistoryEntry>((entry) => ({
      id: entry.id,
      email: entry.email,
      name: entry.name ?? null,
      role: entry.role === "staff" ? "staff" : "client",
      lastActiveAt: entry.lastActiveAt ?? new Date(0).toISOString(),
    }))
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

    return sanitizeEntries(parsed as AccountHistoryEntry[]);
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
