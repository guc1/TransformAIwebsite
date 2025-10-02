import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function PostSignInPage({ params }: PageProps) {
  const session = await getAuthSession();
  const locale = params.locale;

  if (!session?.user?.id) {
    redirect(`/${locale}/sign-in`);
  }

  const intent = cookies().get("transformai_signup_role")?.value;

  if (intent === "staff") {
    await db
      .update(users)
      .set({ role: "staff", updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    redirect(`/${locale}/dashboard`);
  }

  if (session.user.role === "staff") {
    redirect(`/${locale}/dashboard`);
  }

  redirect(`/${locale}/newsupdates`);
}
