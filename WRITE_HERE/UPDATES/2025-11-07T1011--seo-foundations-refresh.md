# SEO foundations refresh

- **What:** Added canonical host redirects, generated sitemap/robots with next-sitemap, refreshed favicons and structured data, and rewrote homepage/service/contact metadata and content for Dutch/English SEO (including new internal-link sections).
- **Why:** Align the site with the requested canonical domain, improve crawlability, and provide search-friendly copy/markup for key pages.
- **Files:** `apps/www/next.config.mjs`, `apps/www/next-sitemap.config.js`, `apps/www/public/favicon.ico`, `apps/www/app/[locale]/layout.tsx`, `apps/www/app/layout.tsx`, `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/app/[locale]/(site)/contact/page.tsx`, `apps/www/app/[locale]/(site)/pricing/page.tsx`, `apps/www/app/[locale]/(site)/pricing/pricing-page-client.tsx`, `apps/www/components/hero/hero.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `apps/www/package.json`, `apps/www/app/sitemap.xml/route.ts` (removed), `apps/www/app/robots.txt` (removed), `apps/www/next-sitemap.config.js`, `apps/www/public/favicon.ico`, `pnpm-lock.yaml`.
- **Follow-ups:** None; rerun `pnpm --filter www run typecheck` once upstream chat component typings are resolved.
