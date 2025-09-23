# Stabilized hero hours-saved counter math
- **What:** Corrected the UTC day calculation to clamp at zero, recalculated daily totals using the helper, tightened burst allocation to always match each day’s cap, and seeded the stored maximum from localStorage before animating.
- **Why:** The counter could under-count or get stuck due to negative day offsets and rounding drift, and persisted values were not always respected on mount.
- **Files:** `apps/www/lib/timeSeries/hoursSaved.ts`, `apps/www/components/HeroHoursSaved.tsx`.
- **Follow-ups:** Monitor the hero layout once more burst styles ship; no further action required if the counter stays monotonic.
