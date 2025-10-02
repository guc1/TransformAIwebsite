import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { resolveSessionRedirect } from "@/lib/auth-redirect";

const SIGNUP_INTENT_COOKIE = "transformai_signup_role";

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

  const cookieStore = cookies();
  const intent = cookieStore.get(SIGNUP_INTENT_COOKIE)?.value;

  if (intent) {
    cookieStore.delete(SIGNUP_INTENT_COOKIE);
  }

  let role = session.user.role;

  if (intent === "staff" && session.user.id && session.user.role !== "staff") {
    await db
      .update(users)
      .set({ role: "staff", updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    role = "staff";
  }

  const destination = resolveSessionRedirect(
    {
      ...session,
      user: {
        ...session.user,
        role,
      },
    },
    locale,
  );

  redirect(destination ?? `/${locale}/sign-in`);
}
