# Special offer i18n hotfix

- **What:** Switched the special offer client to pull copy via `useTranslations`, localized page metadata, and validated locales before rendering.
- **Why:** The `/specialoffer` page showed English text regardless of the selected locale because copy was baked into server props and metadata was hard-coded.
- **Files:** `apps/www/app/[locale]/(site)/specialoffer/page.tsx`, `apps/www/app/[locale]/(site)/specialoffer/client.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** None.
