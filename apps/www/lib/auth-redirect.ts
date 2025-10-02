import { eq } from "drizzle-orm";
import type { Session } from "next-auth";

import { db } from "@/lib/db/client";
import { type UserRole, users } from "@/lib/db/schema";

type SessionWithRole = Session & {
  user?: Session["user"] & {
    id?: string | null;
    role?: string | null;
  };
};

interface ResolvedSessionUser {
  id: string;
  role: UserRole;
}

async function resolveSessionUser(
  session: SessionWithRole | null,
): Promise<ResolvedSessionUser | null> {
  const user = session?.user;

  if (!user) {
    return null;
  }

  if (user.id && user.role) {
    return { id: user.id, role: user.role as UserRole };
  }

  const email = user.email?.toLowerCase();

  if (!email) {
    return null;
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      id: true,
      role: true,
    },
  });

  if (!dbUser) {
    return null;
  }

  return { id: dbUser.id, role: dbUser.role };
}

export async function resolveSessionRedirect(
  session: SessionWithRole | null,
  locale: string,
): Promise<string | null> {
  const resolvedUser = await resolveSessionUser(session);

  if (!resolvedUser) {
    return null;
  }

  if (resolvedUser.role === "staff") {
    return `/${locale}/dashboard`;
  }

  return `/${locale}/members`;
}

export { resolveSessionUser };
