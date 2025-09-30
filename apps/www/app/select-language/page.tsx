import { UnkeyLogo } from "@/components/footer/footer-svgs";
import { type Locale, defaultLocale } from "@/i18n/routing";
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
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0">
          <iframe
            src={`/${defaultLocale}`}
            title="TransformAI preview"
            loading="lazy"
            tabIndex={-1}
            aria-hidden={true}
            className="h-full w-full scale-[1.05] transform border-0 blur-lg opacity-70 pointer-events-none saturate-[0.85]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/90" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16 sm:py-24">
        <div className="relative w-full max-w-xl">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-r from-sky-500/25 via-blue-500/15 to-fuchsia-500/30 opacity-80 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] px-8 py-12 text-center shadow-[0_32px_140px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-x-8 -top-40 h-56 rounded-full bg-gradient-to-r from-sky-400/40 via-blue-500/15 to-fuchsia-500/45 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.25),_rgba(15,23,42,0))]" />
            </div>

            <div className="flex flex-col items-center gap-6">
              <UnkeyLogo className="h-10 w-auto" />
              <p className="text-sm text-white/70">{t("tagline")}</p>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t("selectTitle")}
              </h1>
              <form action="/api/select-language" method="post" className="mt-4 grid w-full gap-4 text-left">
                {options.map(({ locale, label }) => (
                  <button
                    key={locale}
                    type="submit"
                    name="locale"
                    value={locale}
                    className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <span className="relative z-10">{label}</span>
                    <span
                      aria-hidden
                      className="absolute inset-0 z-0 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-sky-500/30 via-blue-500/15 to-fuchsia-500/35" />
                    </span>
                    <span className="relative z-10 text-sm font-medium uppercase tracking-[0.2em] text-white/60">
                      {locale.toUpperCase()}
                    </span>
                  </button>
                ))}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
