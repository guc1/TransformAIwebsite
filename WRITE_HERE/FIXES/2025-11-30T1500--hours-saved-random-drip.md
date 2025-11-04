# Smooth hours-saved ticker with daily random targets

- **What:** Reworked the hours-saved scheduler to break each hour into multiple micro-increments driven by a configurable daily total, added staff controls for the daily target with an auto-regenerate button, and exposed the new target to the dashboard and hero API so the homepage number now drips in throughout each hour.
- **Why:** The previous implementation dropped the full hourly amount near the start of the hour and lacked a single control for the daily total; stakeholders needed a smoother cadence and an easy way to retune the automated additions.
- **Files:** `apps/www/lib/hours-saved/**`, `apps/www/app/[locale]/(site)/dashboard/**`, `apps/www/app/api/hours-saved/route.ts`, `apps/www/messages/*.json`, `apps/www/lib/db/schema.ts`.
- **Follow-ups:** Consider persisting a seed per day to make the random schedule deterministic for auditing, and explore visualizing the regenerated plan so staff can preview the distribution before saving.
