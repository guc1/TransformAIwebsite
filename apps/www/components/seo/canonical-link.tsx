"use client";

import Head from "next/head";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const FALLBACK_CANONICAL_ORIGIN = "https://transformai.nl";

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, "");
}

function normalizePath(pathname: string | null) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function CanonicalLink() {
  const pathname = usePathname();

  const canonicalUrl = useMemo(() => {
    const base = normalizeOrigin(
      process.env.NEXT_PUBLIC_BASE_URL ?? FALLBACK_CANONICAL_ORIGIN,
    );

    const normalizedPath = normalizePath(pathname);

    return normalizedPath === "/" ? base : `${base}${normalizedPath}`;
  }, [pathname]);

  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
}

