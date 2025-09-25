# Restored budget card hierarchy with localized layout
_When:_ 2025-11-02 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Make the budgets card show its JSON preview again, keep it to seven visible lines, move the project pill onto the credits row, and ensure the remaining elements follow the requested order.
- **Fix:**
  - Locked the code pane to a 7-line viewport with a bottom fade so the JSON is always visible without overwhelming the card.
  - Rebuilt the metrics stack so the credits meter and “project 22” pill share a row, the rate limit badge slots directly below, and the heading/paragraph flow beneath.
- **Files:** `apps/www/components/rate-limits-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.
