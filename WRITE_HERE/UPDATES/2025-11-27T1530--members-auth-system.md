# Members auth system and protected content
- **What:** Added a Drizzle/Postgres-backed NextAuth setup with Google + email sign-up, new Create Account and Sign In flows, staff-code gating, and protected News Updates and staff dashboard pages.
- **Why:** The user wanted members to register directly on the site, unlock a client-only news feed, and route staff to an internal dashboard with role-aware counts.
- **Files:** `apps/www/app/api/auth/*`, `apps/www/app/[locale]/(site)/*`, `apps/www/components/auth/*`, `apps/www/lib/{auth,db,env}.ts`, `apps/www/messages/*.json`, `apps/www/drizzle/*`, `apps/www/README.md`, `.env.example`, package manifests.
- **Follow-ups:** Hook up production Postgres credentials, confirm Google OAuth callback URLs, and polish dashboard analytics once live data is available.
