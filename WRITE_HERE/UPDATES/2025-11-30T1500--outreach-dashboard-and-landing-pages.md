# Outreach dashboard and personalised landing pages

- **What:** Added a staff-only outreach management dashboard with CSV import, bulk publishing, and metrics; introduced database support and API hooks for personalised outreach pages; and shipped the customer-facing `/outreach/[slug]` experience with countdown messaging and CTAs.
- **Why:** Enables the team to prepare bespoke outreach links in batches and automatically serve tailored copy the moment a prospect clicks their personalised URL.
- **Files:** `apps/www/lib/db/schema.ts`, `apps/www/drizzle/0003_outreach_pages.sql`, `apps/www/lib/outreach/**`, `apps/www/app/[locale]/(site)/dashboard/**`, `apps/www/app/[locale]/(site)/outreach/[slug]/page.tsx`, `apps/www/messages/*.json`, `apps/www/components/outreach/countdown-timer.tsx`.
- **Follow-ups:** Wire up the public API endpoint for automated outreach entry creation; consider pagination/filtering for large outreach lists; add automated tests once dependencies for `next-intl` typing are available.
