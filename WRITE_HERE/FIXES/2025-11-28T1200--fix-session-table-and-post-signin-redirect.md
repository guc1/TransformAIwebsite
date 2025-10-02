# Fix session table mapping and post-signin redirect
- **What:** Renamed the NextAuth session table to the singular `session` in schema/migrations with a guard migration, and switched sign-in/up forms to use Next.js routing so the callback URL no longer duplicates the locale prefix.
- **Why:** NextAuth threw `relation "session" does not exist` because it queried a singular table while Drizzle created `sessions`. The sign-in flow also redirected to `/en/en/auth/post-signin`, causing a 404 after authentication.
- **Files:** `apps/www/lib/db/schema.ts`, `apps/www/drizzle/0000_initial.sql`, `apps/www/drizzle/0001_fix_session_table.sql`, `apps/www/components/auth/sign-in-form.tsx`, `apps/www/components/auth/sign-up-form.tsx`.
- **Follow-ups:** Ensure the new migration runs on the deployed database and verify Google OAuth once production credentials are configured.
