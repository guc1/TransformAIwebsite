# Restore staff planner JSX closure
- **What:** Removed an extra JSX closing fragment in the staff planning component that prevented the dashboard planning page fr
  om compiling.
- **Why:** The stray `);` + `}` pair introduced a syntax error that crashed the staff planner route when loading in staff mode.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/planning/components/planner.tsx`.
- **Follow-ups:** None.
