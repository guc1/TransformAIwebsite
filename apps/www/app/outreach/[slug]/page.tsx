import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isLocale } from "@/i18n/routing";

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export const dynamic = "force-dynamic";

export default function OutreachRedirectPage({ params }: PageProps) {
  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : null;
  const targetSlug = params.slug;

  if (locale) {
    redirect(`/${locale}/outreach/${targetSlug}`);
  }

  const nextPath = `/outreach/${targetSlug}`;
  const encodedNext = encodeURIComponent(nextPath);

  redirect(`/select-language?next=${encodedNext}`);
}
