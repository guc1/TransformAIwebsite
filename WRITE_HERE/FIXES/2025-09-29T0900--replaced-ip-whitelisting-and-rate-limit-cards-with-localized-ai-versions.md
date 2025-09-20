# Replaced IP whitelisting and rate limit cards with localized AI versions
_When:_ 2025-09-29 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Refresh the paired homepage cards so they communicate AI data and IP protection plus team budget controls, with localized copy and updated visuals that drop the raw IP and API key references.
- **Fix:**
  - Converted both card components to client-side translations, swapped the IP-focused badges for policy/compliance chips with new shield, lock, and residency glyphs, and added a credits usage meter with wallet iconography.
  - Updated the JSON code sample, project pill, and inline stats to reflect credits and fair-use rate limits while wiring English and Dutch strings under the `Security` and `Budgets` namespaces.
- **Files:** `apps/www/components/ip-whitelisting-bento.tsx`, `apps/www/components/rate-limits-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.
