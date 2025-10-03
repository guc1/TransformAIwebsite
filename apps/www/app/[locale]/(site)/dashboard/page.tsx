import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getAuthSession } from "@/lib/auth";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = params;
  const session = await getAuthSession();

  if (session?.user?.role !== "staff") {
    redirect(`/${locale}/newsupdates`);
  }

  const t = await getTranslations({ locale, namespace: "DashboardOverview" });

  const links = [
    {
      key: "hoursSaved" as const,
      href: `/${locale}/dashboard/hours-saved`,
      eyebrow: t("sections.hoursSaved.eyebrow"),
      title: t("sections.hoursSaved.title"),
      description: t("sections.hoursSaved.description"),
    },
    {
      key: "planning" as const,
      href: `/${locale}/dashboard/planning`,
      eyebrow: t("sections.planning.eyebrow"),
      title: t("sections.planning.title"),
      description: t("sections.planning.description"),
    },
  ];

  return (
    <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)] py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-300px] h-[580px] bg-gradient-to-b from-sky-400/25 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-5xl space-y-12">
        <header className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
            {t("eyebrow")}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-base text-white/70 sm:text-lg">{t("subtitle")}</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {links.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white shadow-lg transition hover:border-white/40 hover:bg-white/10"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
                  {item.eyebrow}
                </span>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {item.title}
                </h2>
                <p className="text-sm text-white/60 sm:text-base">{item.description}</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 group-hover:text-white">
                {t("cta")}
                <span aria-hidden className="translate-x-0 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
