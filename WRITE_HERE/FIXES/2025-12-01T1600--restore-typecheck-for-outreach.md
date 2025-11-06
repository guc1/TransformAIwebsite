# Restore typecheck for outreach rollout

- **What:** Tightened locale typing for the post-sign-in redirect, corrected the hours-saved ticker format type, and sanitized account history parsing so TypeScript infers the expected shapes.
- **Why:** The outreach dashboard follow-up introduced strictness issues that blocked `pnpm --filter www run typecheck`; these adjustments re-align the implementation with the existing locale and telemetry contracts.
- **Files:** `apps/www/app/[locale]/(site)/auth/post-signin/page.tsx`, `apps/www/components/hero/hours-saved-ticker.tsx`, `apps/www/lib/account-history.ts`
- **Follow-ups:** Keep lint suppression work on the roadmap so `pnpm --filter www run lint` can complete without legacy violations.
