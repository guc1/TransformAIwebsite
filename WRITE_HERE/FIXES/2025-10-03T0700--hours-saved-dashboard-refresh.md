# Simplified hours saved dashboard scheduler

- **What:** Rebuilt the staff dashboard to show a compact seven-day hours-saved planner with per-hour editing, copy-day workflows, and updated translations while extending the scheduling window to 168 hours.
- **Why:** The previous bento-style dashboard felt chaotic and surfaced a missing translation error, making it hard for staff to manage the ticker reliably.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/page.tsx`, `apps/www/app/[locale]/(site)/dashboard/components/hours-saved-manager.tsx`, `apps/www/lib/hours-saved/constants.ts`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Consider adding automated tests once `next-intl` and database tooling are installed locally to get lint/typecheck passing.
