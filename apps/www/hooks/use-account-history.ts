"use client";

import { useEffect, useState } from "react";

import {
  ACCOUNT_HISTORY_EVENT,
  type AccountHistoryEntry,
  getAccountHistoryFromDocument,
} from "@/lib/account-history";

export function useAccountHistory() {
  const [accounts, setAccounts] = useState<AccountHistoryEntry[]>([]);

  useEffect(() => {
    const update = () => {
      setAccounts(getAccountHistoryFromDocument());
    };

    update();
    window.addEventListener(ACCOUNT_HISTORY_EVENT, update);
    return () => {
      window.removeEventListener(ACCOUNT_HISTORY_EVENT, update);
    };
  }, []);

  return accounts;
}
