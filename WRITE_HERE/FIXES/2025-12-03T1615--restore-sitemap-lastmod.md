# Restore sitemap lastmod accuracy

- **What:** Rebuilt the next-sitemap config to pull `lastmod` timestamps from Git history, ensure hreflang alternates point to the NL/EN canonicals, and expose the sitemap location via robots.txt.
- **Why:** The previous sitemap setup went missing after removing the route handler and lacked trustworthy last modified metadata, so search engines could not discover or prioritise the canonical URLs.
- **Files:** `apps/www/next-sitemap.config.js`, `WRITE_HERE/UPDATES/2025-11-07T1011--seo-foundations-refresh.md`.
- **Follow-ups:** Run `pnpm --filter www run build && pnpm --filter www run postbuild` during deployment so next-sitemap can emit `sitemap.xml` and `robots.txt` into `public/`.
