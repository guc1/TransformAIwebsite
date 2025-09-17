"use client";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("LanguageSwitcher");
  const languageT = useTranslations("Language");

  const languageNames = useMemo(
    () => ({
      en: languageT("english"),
      nl: languageT("dutch"),
    }),
    [languageT],
  );

  const currentLabel = t("current", { language: languageNames[locale as keyof typeof languageNames] ?? locale });

  return (
    <label className={cn("flex items-center gap-2 text-sm text-white/70", className)}>
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        title={currentLabel}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value;
          if (nextLocale === locale) {
            return;
          }

          const search = searchParams.toString();
          const destination = search ? `${pathname}?${search}` : pathname;
          void router.replace(destination, { locale: nextLocale });
        }}
        className="h-8 rounded-md border border-white/20 bg-black/60 px-2 text-sm text-white/80 shadow-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        {locales.map((code) => (
          <option key={code} value={code} className="text-black">
            {languageNames[code as keyof typeof languageNames] ?? code}
          </option>
        ))}
      </select>
    </label>
  );
}
