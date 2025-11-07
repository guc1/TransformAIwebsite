# Add sitemap.xml route handler

- **What:** Added an App Router handler at `app/sitemap.xml/route.ts` that enumerates locale-aware marketing pages, emits hreflang alternates, and stamps entries with filesystem `lastmod` dates for crawlers.
- **Why:** The sitemap route had been removed, so crawlers could not fetch `https://transformai.nl/sitemap.xml`; reinstating it restores discoverability for the NL/EN marketing pages.
- **Files:** `apps/www/app/sitemap.xml/route.ts`.
- **Follow-ups:** Extend `localizedRoutes` as new sections launch to keep the sitemap comprehensive.
