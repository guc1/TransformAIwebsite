# Hours saved metric is now configurable

- **What:** Added persistent tables and APIs to manage the automatic “hours saved by AI” ticker, exposed a staff dashboard dialog to edit the next 24 hourly increments and starting amount, and animated the homepage ticker when new hours are applied. The hero now pulls live data via `/api/hours-saved`.
- **Why:** Staff need to tweak the hourly automation and reset the counter without touching code while visitors should see a polished, animated number as it updates.
- **Files:** `apps/www/lib/db/schema.ts`, `apps/www/lib/hours-saved/**`, `apps/www/app/[locale]/(site)/dashboard/**`, `apps/www/app/api/hours-saved/route.ts`, `apps/www/components/hero/**`, `apps/www/messages/*.json`.
- **Follow-ups:** Consider adding auth around the API if exposed publicly, and revisit long-term retention of historical increment rows.
