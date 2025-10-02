# Meeting planner timezone and translation polish
- **What:** Hardened the staff planning grid with timezone-aware dragging/resizing, prevented deletion of booked slots, surfaced actionable error messaging, and filled in Dutch translations for the Planning interface. Also added reusable utilities for meeting day bounds/minute conversions.
- **Why:** Drag interactions were susceptible to DST offsets and server mutations allowed removing confirmed meetings; Dutch strings were missing for the new planner.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/planning/components/planner.tsx`, `apps/www/lib/meetings/utils.ts`, `apps/www/lib/meetings/mutations.ts`, `apps/www/app/[locale]/(site)/dashboard/planning/actions.ts`, `apps/www/messages/{en,nl}.json`.
- **Follow-ups:** Investigate global lint/typecheck failures flagged in existing startup/auth modules; consider adding automated tests around meeting slot CRUD.
