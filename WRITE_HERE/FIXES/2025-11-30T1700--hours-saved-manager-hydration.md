# Stabilized hours-saved manager today bucket

- **What:** Pass the server-side reference timestamp into the hours-saved manager and derive the "today" bucket key from it so the highlighted day is computed deterministically.
- **Why:** The client component previously called `new Date()` during render, so users in timezones ahead of the server saw a different day highlighted than the server-rendered HTML, triggering hydration failures on load.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/components/hours-saved-manager.tsx`, `apps/www/app/[locale]/(site)/dashboard/hours-saved/page.tsx`.
- **Follow-ups:** Consider centralizing reusable helpers for time-zone aware comparisons if more scheduling UI appears.
