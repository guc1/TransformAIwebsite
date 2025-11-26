# Added campaign and sub segmentation to outreach manager

- **What:** Required Campaign and Sub columns in the outreach CSV importer, validated their formats, surfaced them in the preview/table UI, and added multi-select filters for campaign codes and sub segment parts. Synced the backend schema to store the new fields.
- **Why:** Outreach records now need campaign tracking and sub-level segmentation, and staff must be able to slice the dashboard by each dimension.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/components/outreach-manager.tsx`, `apps/www/app/[locale]/(site)/dashboard/outreach/actions.ts`, `apps/www/lib/outreach/index.ts`, `apps/www/lib/db/schema.ts`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Consider backfilling existing outreach records with campaign/sub data via a migration if historical rows exist.
