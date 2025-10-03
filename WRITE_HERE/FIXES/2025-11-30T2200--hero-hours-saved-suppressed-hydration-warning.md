# Suppressed hero ticker hydration error overlay
- **What:** Added `suppressHydrationWarning` to the hero hours-saved ticker span so hydration mismatches no longer surface a blocking runtime overlay.
- **Why:** The ticker still drifts between server and client values, and the user requested hiding the hydration error from appearing on the site while a deeper fix is deferred.
- **Files:** `apps/www/components/hero/hours-saved-ticker.tsx`.
- **Follow-ups:** Revisit the ticker formatting strategy to eliminate server/client divergence without relying on suppression.
