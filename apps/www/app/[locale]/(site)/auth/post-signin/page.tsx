import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { RedirectGate } from "./redirect-gate";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { AccountHistoryInput } from "@/lib/account-history";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function PostSignInPage({ params }: PageProps) {
  const session = await getAuthSession();
  const locale = params.locale;

  if (!session?.user?.id || !session.user.email) {
    redirect(`/${locale}/sign-in`);
  }

  const intent = cookies().get("transformai_signup_role")?.value;
  const account: AccountHistoryInput = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    role: session.user.role === "staff" ? "staff" : "client",
  };

  if (intent === "staff") {
    await db
      .update(users)
      .set({ role: "staff", updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    account.role = "staff";
  }

  const targetPath = account.role === "staff" ? "/dashboard" : "/newsupdates";

  return <RedirectGate locale={locale} targetPath={targetPath} account={account} />;
}
