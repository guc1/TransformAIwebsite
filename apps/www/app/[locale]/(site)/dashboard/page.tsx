import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function DashboardPage({ params }: PageProps) {
  const session = await getAuthSession();
  const locale = params.locale;

  if (session?.user?.role !== "staff") {
    redirect(`/${locale}/newsupdates`);
  }

  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const roleCounts = await db
    .select({
      role: users.role,
      total: sql<number>`count(*)`,
    })
    .from(users)
    .groupBy(users.role);

  const totals: Record<string, number> = { client: 0, staff: 0 };
  for (const row of roleCounts) {
    totals[row.role] = Number(row.total);
  }

  const metrics = [
    {
      key: "client",
      title: t("metrics.clients.title"),
      value: totals.client,
      caption: t("metrics.clients.caption", { count: totals.client }),
    },
    {
      key: "staff",
      title: t("metrics.staff.title"),
      value: totals.staff,
      caption: t("metrics.staff.caption", { count: totals.staff }),
    },
    {
      key: "ratio",
      title: t("metrics.ratio.title"),
      value: totals.staff === 0 ? "–" : `${(totals.client / totals.staff).toFixed(1)} : 1`,
      caption: t("metrics.ratio.caption"),
    },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.22),_transparent_55%)] py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-280px] h-[560px] bg-gradient-to-b from-blue-500/20 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">{t("eyebrow")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("title")}</h1>
            <p className="mt-4 text-base text-white/60 sm:text-lg">{t("subtitle")}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-xs text-white/70">
            {t("currentUser", { email: session.user.email ?? "" })}
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {metrics.map((metric, index) => (
            <Card
              key={metric.key}
              className={cn(
                "relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl transition",
                index === 0 ? "md:col-span-1" : "",
              )}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white/70">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-4xl font-semibold tracking-tight text-white">
                  {typeof metric.value === "number" ? metric.value.toLocaleString(locale) : metric.value}
                </p>
                <p className="mt-2 text-sm text-white/60">{metric.caption}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-black/40 p-8 text-sm leading-relaxed text-white/70">
          <h2 className="text-xl font-semibold text-white">{t("nextSteps.title")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>{t("nextSteps.items.audit")}</li>
            <li>{t("nextSteps.items.outreach")}</li>
            <li>{t("nextSteps.items.briefings")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
