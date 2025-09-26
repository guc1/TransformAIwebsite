# Built AI activity feed usage bento with full localization
_When:_ 2025-09-27 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Replace the billing-focused usage bento with an AI activity feed that highlights task actors, descriptions, meta details, and precise durations while localizing all copy in English and Dutch.
- **Fix:**
  - Replaced the billing row component with a reusable `ActivityItem`, introduced task-specific AI icons, and surfaced actor, description, meta, and duration data sourced from the Activity translation namespace.
  - Localized the sidebar title and body along with each activity entry in the English and Dutch message catalogs, keeping time values as untranslated duration strings.
- **Files:** `apps/www/components/usage-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.
