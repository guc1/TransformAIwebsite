# Visitor chart adds fixed-width scroll rail

- **What:** Gave each traffic column a fixed width inside a horizontally scrollable rail, styled the scrollbar for visibility, and tucked the hourly labels within the chart box so longer ranges stay accessible.
- **Why:** Staff members could only see the first few hourly buckets because the axis spilled past the container and there was no reliable horizontal scroll affordance.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/components/visitors-chart.tsx`.
- **Follow-ups:** Consider persisting the last viewed tab and scroll offset per user to improve continuity between sessions.
