# Polished AI protection and team budget cards
_When:_ 2025-10-31 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Deliver production-ready layouts for the AI protection and team budgets cards so copy never collides with floating chips or the JSON panel across breakpoints.
- **Root cause:** The first refresh left policy badges large enough to drift into the text safe area and the rate limit code viewer flexible, allowing the project pill and credits meter to crowd the heading zone on smaller screens.
- **Fix:**
  - Anchored the policy badges to the radar rings with smaller, lower-opacity chips and deepened the text-side gradients to preserve a clear reading zone.
  - Locked the JSON preview to seven lines with hidden overflow, tightened the bottom fade, and rebuilt the credits row so the usage meter and “#22” project pill align cleanly with added padding.
- **Files:** `apps/www/components/ip-whitelisting-bento.tsx`, `apps/www/components/rate-limits-bento.tsx`, `UPDATE.md`.
- **Follow-ups:** None.
