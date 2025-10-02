# Hours-saved counter is configurable and animated

- **What:** Added a database-backed automation plan for the hero's "hours saved" counter, a staff dashboard panel to adjust the starting value and hourly increments, an API endpoint powering the homepage counter with animated updates, and documentation of the defaults in both locales.
- **Why:** Staff need to steer the hourly AI savings narrative and set the live total without code changes while the marketing site reflects the new value with a polished animation.
- **Files:** `apps/www/lib/db/schema.ts`, `apps/www/lib/hours-saved.ts`, `apps/www/app/[locale]/(site)/dashboard/*`, `apps/www/components/hero/*`, `apps/www/app/api/hours-saved/route.ts`, translations, and a new migration.
- **Follow-ups:** Run pending database migrations in the target environment and ensure the missing `next-intl`/`drizzle-orm` packages are available so lint/typecheck succeed in CI.
