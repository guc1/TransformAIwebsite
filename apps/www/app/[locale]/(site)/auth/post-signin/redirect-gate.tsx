"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { rememberAccount, type AccountHistoryInput } from "@/lib/account-history";

interface RedirectGateProps {
  targetPath: string;
  account: AccountHistoryInput;
}

export function RedirectGate({ targetPath, account }: RedirectGateProps) {
  const router = useRouter();
  const t = useTranslations("Auth.PostSignIn");
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) {
      return;
    }

    hasRedirected.current = true;
    rememberAccount(account);
    router.replace(targetPath);
  }, [account, router, targetPath]);

  const displayName = account.name?.trim() || account.email;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
      <Loader2 className="h-6 w-6 animate-spin text-sky-400" aria-hidden />
      <p className="text-sm text-white/60">{t("redirecting", { name: displayName })}</p>
    </div>
  );
}
