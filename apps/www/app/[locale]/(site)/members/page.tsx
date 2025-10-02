import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { MemberUpdatesSection } from "@/components/members/member-updates-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    locale: string;
  };
}

const ALLOWED_ROLES = ["client", "staff"] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

const RESOURCE_KEYS = ["roadmap", "briefing", "workshop"] as const;
const UPDATE_KEYS = ["aiMaturity", "events", "playbooks"] as const;

export default async function MembersPage({ params }: PageProps) {
  const session = await getAuthSession();
  const locale = params.locale;

  if (!session || !session.user) {
    redirect(`/${locale}/sign-in`);
  }

  const role = session.user.role as AllowedRole | undefined;

  if (!role || !ALLOWED_ROLES.includes(role)) {
    redirect(`/${locale}/sign-in`);
  }

  const user = session.user;

  const [membersT, updatesT] = await Promise.all([
    getTranslations({ locale, namespace: "Members" }),
    getTranslations({ locale, namespace: "NewsUpdates" }),
  ]);

  const updateItems = UPDATE_KEYS.map((key) => ({
    key,
    title: updatesT(`items.${key}.title`),
    date: updatesT(`items.${key}.date`),
    summary: updatesT(`items.${key}.summary`),
    badge: updatesT(`items.${key}.badge`),
  }));

  const resources = RESOURCE_KEYS.map((key) => ({
    key,
    title: membersT(`resources.items.${key}.title`),
    description: membersT(`resources.items.${key}.description`),
    cta: membersT(`resources.items.${key}.cta`),
  }));

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),_transparent_55%)] py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-280px] h-[560px] bg-gradient-to-b from-emerald-400/20 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-6xl space-y-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">{membersT("eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {membersT("title", { name: user?.name ?? "" })}
          </h1>
          <p className="mt-4 text-base text-white/60 sm:text-lg">{membersT("subtitle")}</p>
          <p className="mt-6 text-sm text-white/50">
            {membersT("currentUser", { email: user?.email ?? "" })}
          </p>
        </header>

        <section className="space-y-8">
          <div className="mx-auto max-w-3xl text-center md:max-w-none md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300/70">
              {membersT("resources.eyebrow")}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {membersT("resources.title")}
            </h2>
            <p className="mt-2 text-sm text-white/60 sm:text-base">{membersT("resources.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {resources.map((resource) => (
              <Card key={resource.key} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-white/70">
                  <p>{resource.description}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300/70">{resource.cta}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <MemberUpdatesSection
          eyebrow={updatesT("eyebrow")}
          title={updatesT("title")}
          subtitle={updatesT("subtitle")}
          ctaNote={updatesT("ctaNote")}
          updates={updateItems}
        />
      </div>
    </div>
  );
}
