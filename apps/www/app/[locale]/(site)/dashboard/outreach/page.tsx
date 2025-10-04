import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { OutreachManager } from "../components/outreach-manager";
import { getAuthSession } from "@/lib/auth";
import { listOutreachPages, serializeOutreachPages } from "@/lib/outreach";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function OutreachDashboardPage({ params }: PageProps) {
  const { locale } = params;
  const session = await getAuthSession();

  if (session?.user?.role !== "staff") {
    redirect(`/${locale}/newsupdates`);
  }

  const t = await getTranslations({ locale, namespace: "DashboardOutreach" });
  const pages = await listOutreachPages();
  const serializedPages = serializeOutreachPages(pages);

  return (
    <div className="bg-black py-12 sm:py-16">
      <div className="container max-w-5xl space-y-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
          <p className="text-sm text-white/60 sm:text-base">{t("subtitle")}</p>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            {t("currentUser", { email: session.user.email ?? "" })}
          </p>
        </header>

        <OutreachManager initialPages={serializedPages} locale={locale} />
      </div>
    </div>
  );
}
