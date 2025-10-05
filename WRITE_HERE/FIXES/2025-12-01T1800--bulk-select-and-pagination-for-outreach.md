# Bulk select and paginate outreach table

- **What:** Replaced the per-filter select-all controls with a single bulk selector tied to the outreach table, added multi-row deletion, and introduced configurable page sizes with pagination so every filtered entry can be reviewed without an internal scroll area.
- **Why:** The dashboard only displayed the first few tracked entries and offered separate select-all buttons, which made it impossible to act on every filtered result or delete them all at once.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/components/outreach-manager.tsx`, `apps/www/app/[locale]/(site)/dashboard/outreach/actions.ts`, `apps/www/lib/outreach/index.ts`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Consider adding confirmation prompts before bulk deletions and surfacing total record counts alongside pagination metadata.
