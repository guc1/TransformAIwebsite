# Refreshed partner heading and code examples messaging
_When:_ 2025-09-24 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Replace the "Powering" label on the homepage with "Partners" and update the duplicated "Any language, any framework, always secure" copy in the code examples section with the new English and Dutch messaging.
- **Fix:**
  - Fetched the logo cloud heading via next-intl so both desktop and mobile variants render the localized "Partners" label.
  - Added a `CodeExamples` namespace to the locale catalogs and rendered two localized `SectionTitle` blocks that reflect the requested TransformAI assistant and project explorer descriptions.
- **Files:** `apps/www/app/[locale]/(site)/(components)/logo-cloud-content.tsx`, `apps/www/app/code-examples.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`
- **Follow-ups:** None.
