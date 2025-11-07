# Serve favicon from existing assets

- **What:** Removed the committed `.ico` binary, reused the existing TransformAI logo assets for metadata, and added a `/favicon.ico` route that serves the PNG variant with long-lived caching.
- **Why:** GitHub flagged the newly added binary favicon; reusing the in-repo artwork keeps SEO metadata intact without shipping extra binaries.
- **Files:** `apps/www/app/layout.tsx`, `apps/www/app/[locale]/layout.tsx`, `apps/www/app/favicon.ico/route.ts`.
- **Follow-ups:** None.
