import { TransformAILogo } from "@/components/footer/footer-svgs";
import { type Locale, defaultLocale, isLocale } from "@/i18n/routing";
import { createTranslator } from "next-intl";
import { cookies } from "next/headers";

type LanguageOption = {
  locale: Locale;
  label: string;
};

interface SelectLanguagePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function SelectLanguagePage({
  searchParams,
}: SelectLanguagePageProps) {
  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;
  const previewLocale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const messages = (await import("@/messages/en.json")).default;
  const t = createTranslator({
    locale: defaultLocale,
    namespace: "Language",
    messages,
  });

  const nextParam = searchParams?.next;
  const nextPath = Array.isArray(nextParam) ? nextParam[0] : nextParam ?? "";

  const options: Array<LanguageOption> = [
    { locale: "en", label: t("english") },
    { locale: "nl", label: t("dutch") },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <iframe
          src={`/${previewLocale}`}
          title="TransformAI preview"
          loading="lazy"
          tabIndex={-1}
          aria-hidden={true}
          className="pointer-events-none h-full w-full scale-[1.01] border-0 blur-[2px]"
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16 sm:py-24">
        <div className="relative w-full max-w-xl">
          <div className="pointer-events-none absolute inset-0 -z-20 rounded-[32px] bg-gradient-to-r from-sky-500/25 via-blue-500/15 to-fuchsia-500/30 opacity-80 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 px-8 py-12 text-center shadow-[0_32px_140px_rgba(15,23,42,0.55)] sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-slate-950/90" />
              <div className="absolute inset-x-8 -top-40 h-56 rounded-full bg-gradient-to-r from-sky-400/40 via-blue-500/15 to-fuchsia-500/45 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.18),_rgba(15,23,42,0))]" />
            </div>

            <div className="flex flex-col items-center gap-6">
              <TransformAILogo className="h-12 w-auto" variant="transparent" sizes="200px" />
              <p className="text-sm text-white/70">{t("tagline")}</p>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t("selectTitle")}
              </h1>
              <form action="/api/select-language" method="post" className="mt-4 grid w-full gap-4 text-left">
                <input type="hidden" name="next" value={nextPath} />
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
