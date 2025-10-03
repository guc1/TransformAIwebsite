# Hours-saved planner accepts large increments again

- **What:** Sanitized the dashboard planner to collapse duplicate hourly entries before display and submission, and updated the hours-saved overview API to return one item per hour.
- **Why:** Duplicate rows from older data made the UI unreadable and caused schedule updates with large positive values to fail validation.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/components/hours-saved-manager.tsx`, `apps/www/lib/hours-saved/index.ts`.
- **Follow-ups:** Consider exposing a maintenance script to purge legacy duplicate increments from the database directly.
