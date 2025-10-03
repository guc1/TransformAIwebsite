# Hours saved planner moved and randomized

- **What:** Moved the hours-saved planner to `/dashboard/hours-saved`, refreshed the staff overview tiles, tightened form validation, and randomized each increment within its hour.
- **Why:** The combined dashboard felt cluttered, the planner rejected valid submissions, and updates occurred at the top of every hour instead of gradually.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/**`, `apps/www/components/navbar/navigation.tsx`, `apps/www/lib/hours-saved/**`, `apps/www/messages/*.json`.
- **Follow-ups:** Monitor how the randomized timestamps feel in production and consider exposing range metadata in the API if external tooling needs it.
