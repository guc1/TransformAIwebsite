import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
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

  const updateKeys = ["aiMaturity", "events", "playbooks"] as const;
  const updates = updateKeys.map((key) => ({
    key,
    title: t(`items.${key}.title`),
    date: t(`items.${key}.date`),
    summary: t(`items.${key}.summary`),
    badge: t(`items.${key}.badge`),
  }));

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_55%)] py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-280px] h-[560px] bg-gradient-to-b from-emerald-400/20 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">{t("eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-base text-white/60 sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {updates.map((update, index) => (
            <Card
              key={update.key}
              className={cn(
                "group relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl transition",
                index === 0 ? "md:col-span-2" : "",
              )}
            >
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.32em] text-emerald-300/60">
                  <span>{update.badge}</span>
                  <span className="text-white/40">{update.date}</span>
                </div>
                <CardTitle className="text-2xl font-semibold text-white sm:text-3xl">
                  {update.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-8 text-sm leading-relaxed text-white/70 sm:text-base">
                <p>{update.summary}</p>
                <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-xs text-white/60">
                  {t("ctaNote")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
