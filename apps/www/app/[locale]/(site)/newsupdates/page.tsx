import { MemberUpdatesSection } from "@/components/members/member-updates-section";
import { getAuthSession } from "@/lib/auth";
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
        <MemberUpdatesSection
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          ctaNote={t("ctaNote")}
          updates={updates}
        />
      </div>
    </div>
  );
}
