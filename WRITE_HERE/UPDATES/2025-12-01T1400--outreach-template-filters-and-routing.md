# Outreach template filters and neutral links

- **What:** Added template-aware CSV import, outreach dashboard filters, neutral `/outreach/[slug]` routing, and automatic meeting tracking for outreach bookings.
- **Why:** To let staff experiment with template variants, manage outreach pages at scale, and share locale-agnostic links that still record engagement and bookings.
- **Files:** `apps/www/lib/db/schema.ts`, `apps/www/lib/outreach/*`, `apps/www/app/[locale]/(site)/dashboard/**`, `apps/www/app/[locale]/(site)/outreach/[slug]/page.tsx`, `apps/www/app/outreach/[slug]/page.tsx`, `middleware.ts`, `apps/www/app/select-language/page.tsx`, `apps/www/app/api/select-language/route.ts`, `apps/www/app/[locale]/(site)/meeting/**`, `apps/www/messages/*.json`.
- **Follow-ups:** Consider adding pagination for large outreach lists and supporting additional outreach templates.
