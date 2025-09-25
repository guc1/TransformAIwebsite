# Applied small UI adjustments to AI protection and budget cards
_When:_ 2025-11-01 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Update the paired AI protection and budget cards so the security title drops the “& IP” phrasing and the budget metrics appear in the specified order without clipping the project pill.
- **Fix:**
  - Trimmed the security title translation in English and Dutch to “AI Data Protection,” leaving the existing body copy and policy chips untouched.
  - Reordered the credits meter, rate limit badge, and project pill in the budget card layout while anchoring the pill to the left edge to keep it visible at every breakpoint.
- **Files:** `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `apps/www/components/rate-limits-bento.tsx`, `UPDATE.md`.
- **Follow-ups:** None.
