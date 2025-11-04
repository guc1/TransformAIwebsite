import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { desc } from "drizzle-orm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTACT_REQUEST_TYPES } from "@/app/[locale]/(site)/contact/constants";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { contactMessages } from "@/lib/db/schema";
import { formatDateWithZone } from "@/lib/date";
import { MEETING_TIME_ZONE } from "@/lib/meetings/constants";

type ContactMessageRow = typeof contactMessages.$inferSelect;

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function DashboardInboxPage({ params }: PageProps) {
  const { locale } = params;
  const session = await getAuthSession();

  if (session?.user?.role !== "staff") {
    redirect(`/${locale}/newsupdates`);
  }

  const t = await getTranslations({ locale, namespace: "DashboardInbox" });
  const contactT = await getTranslations({ locale, namespace: "Contact" });
  const messages: ContactMessageRow[] = await db
    .select({
      id: contactMessages.id,
      name: contactMessages.name,
      company: contactMessages.company,
      email: contactMessages.email,
      requestType: contactMessages.requestType,
      description: contactMessages.description,
      locale: contactMessages.locale,
      createdAt: contactMessages.createdAt,
    })
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(100);

  const requestTypeLabels = Object.fromEntries(
    CONTACT_REQUEST_TYPES.map((type) => [
      type.value,
      contactT(`Form.requestTypes.${type.translationKey}.title`),
    ]),
  ) as Record<string, string>;

  return (
    <div className="bg-black py-12 sm:py-16">
      <div className="container max-w-5xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-sm text-white/60 sm:text-base">{t("subtitle")}</p>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            {t("currentUser", { email: session.user.email ?? "" })}
          </p>
        </header>

        {messages.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/60">
            {t("empty")}
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const requestTypeLabel =
                requestTypeLabels[message.requestType] ?? message.requestType;
              const receivedLabel = formatDateWithZone(
                message.createdAt,
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                },
                locale,
                MEETING_TIME_ZONE,
              );

              return (
                <Card
                  key={message.id}
                  className="border-white/10 bg-white/[0.04] text-white shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur"
                >
                  <CardHeader className="space-y-2 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                      <CardTitle className="text-2xl font-semibold text-white">
                        {message.name}
                      </CardTitle>
                      <span className="text-xs font-medium uppercase tracking-[0.28em] text-white/50">
                        {receivedLabel}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{requestTypeLabel}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <dl className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
                      <div className="space-y-1">
                        <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                          {t("table.email")}
                        </dt>
                        <dd>
                          <a
                            href={`mailto:${message.email}`}
                            className="text-white underline-offset-2 transition hover:text-white/80 hover:underline"
                          >
                            {message.email}
                          </a>
                        </dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                          {t("table.company")}
                        </dt>
                        <dd>{message.company?.trim() || "–"}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                          {t("table.requestType")}
                        </dt>
                        <dd>{requestTypeLabel}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                          {t("table.locale")}
                        </dt>
                        <dd className="uppercase">{message.locale}</dd>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                          {t("table.message")}
                        </dt>
                        <dd className="whitespace-pre-wrap break-words text-sm text-white/80">
                          {message.description}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
