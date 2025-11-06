# Enforced canonical domain and refreshed crawl signals

- **What:** Implemented canonical HTTPS domain redirects, injected per-page canonical tags, refreshed robots.txt, and rebuilt the primary sitemap with hreflang metadata for English and Dutch landing pages.
- **Why:** Search engines were receiving conflicting signals from legacy Unkey configuration, blocking clean indexing for transformai.nl.
- **Files:** `middleware.ts`, `apps/www/app/[locale]/layout.tsx`, `apps/www/components/seo/canonical-link.tsx`, `apps/www/app/robots.txt`, `apps/www/app/sitemap.xml/route.ts`, `apps/www/lib/env.ts`.
- **Follow-ups:** Expand sitemap coverage once remaining legacy Unkey content is rewritten for TransformAI; add image/video sitemap extensions when rich media assets are finalized.

