import { env } from "@/lib/env";
import type { Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import { promises as fs } from "node:fs";
import path from "node:path";

type SitemapRoute = {
  segments: string[];
  sourceFile: string;
};

const localizedRoutes: SitemapRoute[] = [
  {
    segments: [],
    sourceFile: "apps/www/app/[locale]/(site)/page.tsx",
  },
  {
    segments: ["about"],
    sourceFile: "apps/www/app/[locale]/(site)/about/page.tsx",
  },
  {
    segments: ["contact"],
    sourceFile: "apps/www/app/[locale]/(site)/contact/page.tsx",
  },
  {
    segments: ["pricing"],
    sourceFile: "apps/www/app/[locale]/(site)/pricing/page.tsx",
  },
  {
    segments: ["blog"],
    sourceFile: "apps/www/app/[locale]/(site)/blog/page.tsx",
  },
  {
    segments: ["glossary"],
    sourceFile: "apps/www/app/[locale]/(site)/glossary/page.tsx",
  },
];

async function getLastModifiedDate(sourceFile: string) {
  try {
    const filePath = path.join(process.cwd(), sourceFile);
    const stats = await fs.stat(filePath);

    return stats.mtime.toISOString().split("T")[0];
  } catch (error) {
    console.warn(`Unable to resolve last modified date for ${sourceFile}`, error);
    return undefined;
  }
}

function buildHref(origin: string, locale: Locale, segments: string[]) {
  const pathSegments = segments.length > 0 ? `/${segments.join("/")}` : "";

  return `${origin}/${locale}${pathSegments}`;
}

export async function GET() {
  const baseUrl = new URL(env().NEXT_PUBLIC_BASE_URL);
  const origin = baseUrl.origin.replace(/\/$/, "");

  const urlEntries: string[] = [];

  for (const route of localizedRoutes) {
    const lastmod = await getLastModifiedDate(route.sourceFile);

    for (const locale of locales) {
      const currentHref = buildHref(origin, locale, route.segments);
      const alternateLinks = locales.map((altLocale) => ({
        hreflang: altLocale,
        href: buildHref(origin, altLocale, route.segments),
      }));
      const xDefaultHref = `${origin}/`;

      const hreflangLinks = [
        ...alternateLinks,
        { hreflang: "x-default", href: xDefaultHref },
      ];

      const hreflangMarkup = hreflangLinks
        .map(
          (link) =>
            `    <xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${link.href}" />`,
        )
        .join("\n");

      const lastmodMarkup = lastmod ? `  <lastmod>${lastmod}</lastmod>\n` : "";

      urlEntries.push(`  <url>\n  <loc>${currentHref}</loc>\n${lastmodMarkup}${hreflangMarkup}\n  </url>`);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlEntries.join("\n")}\n</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

