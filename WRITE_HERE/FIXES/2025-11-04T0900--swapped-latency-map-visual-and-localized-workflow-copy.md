# Swapped latency map visual and localized workflow copy
_When:_ 2025-11-04 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Replace the latency map section visual with the provided workflow PNG and refresh the heading, description, and alt text with localized English/Dutch copy while preserving the layout and original SVG asset in the repo.
- **Fix:**
  - Swapped the map SVG import for the workflow PNG, loading translations from a new `Workflows` namespace so the heading, body, and alt strings stay localized.
  - Added the corresponding English and Dutch message entries to support the new copy and alt text.
- **Files:** `apps/www/components/latency-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.
