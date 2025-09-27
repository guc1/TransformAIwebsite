# Normalized UTC date formatting across client content

- **What:** Added a reusable UTC date formatting helper and updated blog and changelog components to rely on it when rendering dates.
- **Why:** Client-side hydration was failing because locale-sensitive date strings differed between server-rendered markup and the browser when the viewer's timezone shifted the calendar day.
- **Files:** `apps/www/lib/date.ts`, `apps/www/app/[locale]/(site)/blog/[slug]/page.tsx`, `apps/www/app/[locale]/(site)/changelog/page.tsx`, `apps/www/components/blog/blog-card.tsx`, `apps/www/components/blog/blog-hero.tsx`, `apps/www/components/blog/suggested-blogs.tsx`, `apps/www/components/changelog/changelog-grid-item.tsx`.
- **Follow-ups:** Consider migrating remaining utility imports to the shared date helper if new time-sensitive UI appears.
