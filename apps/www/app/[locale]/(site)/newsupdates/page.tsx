import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Lock, MoveRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function NewsUpdatesPage({ params }: PageProps) {
  const session = await getAuthSession();
  const locale = params.locale;

  if (!session?.user?.role || !["client", "staff"].includes(session.user.role)) {
    redirect(`/${locale}/sign-in`);
  }

  const t = await getTranslations({ locale, namespace: "NewsUpdates" });
  const meetingHref = `/${locale}/meeting` as const;
  const premiumResourceItems = ["item1", "item2", "item3"].map((key) =>
    t(`premium.resources.items.${key}`),
  );

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)] py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-280px] h-[560px] bg-gradient-to-b from-sky-400/20 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">{t("eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-base text-white/60 sm:text-lg">{t("subtitle")}</p>
        </div>

        <nav className="mt-14 flex justify-center">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-white/60 backdrop-blur">
            <Link
              href="/newsupdates"
              aria-current="page"
              className="rounded-full bg-sky-500/20 px-5 py-2 font-medium tracking-wide text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] transition"
            >
              {t("tabs.dashboard")}
            </Link>
            <Link
              href="/newsupdates#premium"
              className="rounded-full px-5 py-2 font-medium tracking-wide text-white/60 transition hover:text-white"
            >
              {t("tabs.premium")}
            </Link>
          </div>
        </nav>

        <section aria-labelledby="dashboard-overview" className="mt-16 space-y-10">
          <h2 id="dashboard-overview" className="sr-only">
            {t("overview.heading")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-white/10 bg-white/5 text-white backdrop-blur-xl">
              <CardHeader className="space-y-2 pb-3">
                <p className="text-xs uppercase tracking-[0.32em] text-sky-300/60">
                  {t("overview.progress.eyebrow")}
                </p>
                <CardTitle className="text-2xl font-semibold text-white">
                  {t("overview.progress.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-5xl font-semibold text-white">{t("overview.progress.value")}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {t("overview.progress.caption")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 text-white backdrop-blur-xl">
              <CardHeader className="space-y-2 pb-3">
                <p className="text-xs uppercase tracking-[0.32em] text-sky-300/60">
                  {t("overview.phase.eyebrow")}
                </p>
                <CardTitle className="text-2xl font-semibold text-white">
                  {t("overview.phase.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-5xl font-semibold text-white">{t("overview.phase.value")}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {t("overview.phase.caption")}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 overflow-hidden border-white/10 bg-gradient-to-br from-sky-500/25 via-sky-400/10 to-blue-500/10 text-white shadow-[0_0_60px_rgba(56,189,248,0.18)]">
              <CardContent className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                    {t("overview.cta.eyebrow")}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{t("overview.cta.title")}</h3>
                  <p className="mt-4 max-w-xl text-base text-white/70">{t("overview.cta.subtitle")}</p>
                </div>
                <Button asChild className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.35)] transition hover:shadow-[0_0_35px_rgba(56,189,248,0.45)]">
                  <Link href={meetingHref}>
                    {t("overview.cta.button")}
                    <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="premium" aria-labelledby="premium-access" className="mt-20 space-y-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
              {t("premium.eyebrow")}
            </p>
            <h2 id="premium-access" className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {t("premium.title")}
            </h2>
            <p className="mt-4 text-base text-white/60 sm:text-lg">{t("premium.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-transparent" />
              <CardHeader className="relative space-y-3 pb-4">
                <p className="text-xs uppercase tracking-[0.32em] text-sky-300/60">
                  {t("premium.weekly.eyebrow")}
                </p>
                <CardTitle className="text-2xl font-semibold text-white">
                  {t("premium.weekly.title")}
                </CardTitle>
                <p className="text-sm leading-relaxed text-white/70">
                  {t("premium.weekly.caption")}
                </p>
              </CardHeader>
              <CardContent className="relative space-y-3 pb-8">
                <div className="h-3 w-3/4 rounded-full bg-white/10" aria-hidden />
                <div className="h-3 w-full rounded-full bg-white/10" aria-hidden />
                <div className="h-3 w-2/3 rounded-full bg-white/10" aria-hidden />
                <div className="h-3 w-4/5 rounded-full bg-white/10" aria-hidden />
                <div className="h-3 w-1/2 rounded-full bg-white/10" aria-hidden />
              </CardContent>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/75 backdrop-blur-md">
                <Lock className="h-8 w-8 text-white/70" aria-hidden />
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium text-white/80">{t("premium.weekly.locked")}</p>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/40">
                    {t("premium.weekly.ctaLabel")}
                  </p>
                </div>
                <Button asChild className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20">
                  <Link href={meetingHref}>{t("premium.weekly.button")}</Link>
                </Button>
              </div>
            </Card>

            <Card className="border-white/10 bg-white/5 text-white backdrop-blur-xl">
              <CardHeader className="space-y-3 pb-4">
                <p className="text-xs uppercase tracking-[0.32em] text-sky-300/60">
                  {t("premium.resources.eyebrow")}
                </p>
                <CardTitle className="text-2xl font-semibold text-white">
                  {t("premium.resources.title")}
                </CardTitle>
                <p className="text-sm leading-relaxed text-white/70">
                  {t("premium.resources.caption")}
                </p>
              </CardHeader>
              <CardContent className="space-y-5 pb-8 text-sm leading-relaxed text-white/70">
                <ul className="space-y-3 text-left">
                  {premiumResourceItems.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-white/70">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300/80" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
                  <Link href={meetingHref}>
                    {t("premium.resources.button")}
                    <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
