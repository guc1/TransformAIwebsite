# Ensure homepage hours-saved ticker uses live data

- **What:** Forced the landing page route to render dynamically so the hero ticker receives the latest hours-saved amount on each load.
- **Why:** The page was statically cached, so visitors saw stale totals even after the staff dashboard updated the counter; reloading did not show the new number.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`
- **Follow-ups:** None.
