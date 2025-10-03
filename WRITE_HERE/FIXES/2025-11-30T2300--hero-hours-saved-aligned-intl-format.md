# Align hero hours-saved formatter locale

- **What:** Reused the server-resolved `Intl.NumberFormat` locale for the hero ticker, threading it through the hero props and removing the hydration warning suppression attribute.
- **Why:** The server and browser were formatting the ticker total with different locales, leading to a persistent hydration mismatch warning on refresh.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/hero/hero.tsx`, `apps/www/components/hero/hero-main-section.tsx`, `apps/www/components/hero/hours-saved-ticker.tsx`.
- **Follow-ups:** None—monitor for future locale additions to ensure formatter locale is still threaded through.
