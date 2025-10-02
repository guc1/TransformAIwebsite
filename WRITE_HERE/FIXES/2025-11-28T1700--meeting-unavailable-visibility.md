# Ensure unavailable meeting blocks remain visible
- **What:** Count unavailable but published meeting blocks in the day summaries, surface blocked counts in the staff planner metrics, and extend the legend/translations so staff and visitors can see when time has been intentionally blocked.
- **Why:** Unavailable slots were omitted from totals, causing public visitors and staff planners to miss those blocked windows even though they should signal limited availability.
- **Files:** `apps/www/lib/meetings/queries.ts`, `apps/www/app/[locale]/(site)/dashboard/planning/components/planner.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Consider exposing unavailable block counts on the public day cards if users request more explicit labelling.
