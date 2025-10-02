# Visitor chart percentage scaling and horizontal scroll polish

- **What:** Reworked the visitor traffic chart with a true horizontal scroll rail, a percentage-based axis that normalizes each
  bucket between the minimum and maximum values, and hidden bar chrome for zero-count intervals so flat periods no longer draw
  ghost bars.
- **Why:** Followed up on feedback that only a vertical scrollbar appeared previously and that zero-value entries still looked
  active despite carrying no visits.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/components/visitors-chart.tsx`.
- **Follow-ups:** Consider persisting the last selected tab so returning staff members land on their preferred range.
