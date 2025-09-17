import { locales, type Locale, defaultLocale } from "@/i18n/routing";
import { createTranslator } from "next-intl";

type LanguageOption = {
  locale: Locale;
  label: string;
};

export default async function SelectLanguagePage() {
  const messages = (await import("@/messages/en.json")).default;
  const t = createTranslator({
    locale: defaultLocale,
    namespace: "Language",
    messages,
  });

  const options: Array<LanguageOption> = [
    { locale: "en", label: t("english") },
    { locale: "nl", label: t("dutch") },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-24 text-white">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("selectTitle")}</h1>
        <form action="/select-language" method="post" className="grid gap-4">
          {options.map(({ locale, label }) => (
            <button
              key={locale}
              type="submit"
              name="locale"
              value={locale}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base font-medium transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {label}
            </button>
          ))}
        </form>
      </div>
    </div>
  );
}
