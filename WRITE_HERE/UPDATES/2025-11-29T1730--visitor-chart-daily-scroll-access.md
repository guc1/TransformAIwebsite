# Daily visitor chart shows all buckets

- **What:** Adjusted the visitor traffic component so the scroller spans the available width, removed the forced 960px baseline for the daily view, and kept horizontal scrolling for the hourly dataset only when needed.
- **Why:** Daily analytics buckets were clipped without a horizontal scrollbar, preventing staff from reviewing all days at once.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/components/visitors-chart.tsx`.
- **Follow-ups:** Consider persisting the active tab and last scroll position for returning staff members.
