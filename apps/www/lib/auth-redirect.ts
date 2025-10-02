import type { Session } from "next-auth";

type SessionWithRole = Session & {
  user?: Session["user"] & {
    id?: string | null;
    role?: string | null;
  };
};

export function resolveSessionRedirect(
  session: SessionWithRole | null,
  locale: string,
): string | null {
  const user = session?.user;

  if (!user?.id) {
    return null;
  }

  if (user.role === "staff") {
    return `/${locale}/dashboard`;
  }

  return `/${locale}/members`;
}
