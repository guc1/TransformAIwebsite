# Stabilized hours-saved dashboard metadata hydration

- **What:** Precomputed day and hour labels for the staff hours-saved manager on the server and passed the normalized metadata to the client so the initial render no longer recomputes locale-sensitive strings. Added shared formatters to reuse on the dashboard page and when refreshing the schedule after edits.
- **Why:** The client component was still deriving day buckets with `Intl.DateTimeFormat`, so viewers with different locale data saw different labels than the server-rendered HTML, triggering a hydration failure.
- **Files:** `apps/www/lib/hours-saved/format.ts`, `apps/www/app/[locale]/(site)/dashboard/components/hours-saved-manager.tsx`, `apps/www/app/[locale]/(site)/dashboard/hours-saved/page.tsx`.
- **Follow-ups:** Consider reusing the new formatter helper in the public hero ticker to avoid future divergences when that API evolves.
