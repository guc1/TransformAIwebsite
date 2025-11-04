# Contact inbox and translation refresh

- **What:** Updated contact request categories and email requirements in both locales, persisted submissions to the database with Discord notifications, and added a staff inbox view for reviewing contact messages.
- **Why:** Align the form copy with the latest offerings, capture all inbound enquiries centrally, and alert the team via Discord for faster follow-up.
- **Files:** `apps/www/app/[locale]/(site)/contact/*`, `apps/www/app/[locale]/(site)/dashboard/inbox/page.tsx`, `apps/www/components/navbar/navigation.tsx`, `apps/www/lib/db/schema.ts`, `apps/www/drizzle/0005_contact_messages.sql`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Run the new migration in the target environment and configure `CONTACT_DISCORD_WEBHOOK` (or equivalent) with the production webhook URL if it differs from the provided default.
