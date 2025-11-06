# Suppressed hours saved ticker hydration overlay regression

- **What:** Restored `suppressHydrationWarning` on the hours-saved ticker span so hydration mismatches no longer surface the Nex
t runtime overlay.
- **Why:** The ticker still diverges between server and client renders, and the overlay was reappearing in both dev and produc
tion builds.
- **Files:** `apps/www/components/hero/hours-saved-ticker.tsx`.
- **Follow-ups:** Revisit the ticker formatting so the server and client output remain aligned without suppression.
