# Keep contact submissions flowing when persistence fails

- **What:** Let contact submissions continue to send email and Discord alerts even if the new `contact_messages` table has not been migrated yet, and prevent the staff inbox from crashing when the table is missing.
- **Why:** The contact form returned an error in environments that had not applied the latest database migration, preventing any enquiry from being delivered.
- **Files:** `apps/www/app/[locale]/(site)/contact/server/send-message.ts`, `apps/www/app/[locale]/(site)/dashboard/inbox/page.tsx`, `apps/www/lib/db/errors.ts`.
- **Follow-ups:** Apply the `contact_messages` migration to enable in-app archiving once the database is ready.
