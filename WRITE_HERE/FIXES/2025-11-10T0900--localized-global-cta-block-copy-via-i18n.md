# Localized global CTA block copy via i18n
_When:_ 2025-11-10 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Refresh the reusable CTA near the footer with the new English and Dutch messaging, updated button labels, and localized urgency note without altering its layout or behavior.
- **Fix:**
  - Added a `Cta` translation namespace with the supplied English and Dutch strings and wired the CTA component to read them through `next-intl`.
  - Rendered the localized body copy and urgency note while keeping the existing analytics tracking, button styling, and links intact.
- **Files:** `apps/www/components/cta.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`, `FIX.md`.
- **Follow-ups:** None.
