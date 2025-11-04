# Restored member login session sync
- **What:** Switched NextAuth to JWT-backed sessions and synced the callback logic so role information is hydrated from the databa
se on each request.
- **Why:** Logging in previously failed because NextAuth looked for a non-existent `session` table; using JWT sessions eliminates 
the missing table and keeps redirects working for clients and staff.
- **Files:** `apps/www/lib/auth.ts`.
- **Follow-ups:** Consider trimming the unused Drizzle `sessions` table from the schema in a later cleanup.
