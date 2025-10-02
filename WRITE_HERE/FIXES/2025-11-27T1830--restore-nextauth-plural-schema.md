# Restore NextAuth plural snake_case schema
_When:_ 2025-11-27 18:30 · _Scope:_ apps/www auth · _Author:_ AI assistant

- **What:** Reverted the NextAuth Drizzle models to the original plural snake_case tables, provided an idempotent migration that renames any singular camelCase tables back, and passed the explicit table map to the Drizzle adapter using the correct option keys.
- **Why:** The previous fix renamed the tables in code without the environment applying the migration, causing runtime errors like `relation "user" does not exist` when registering or logging in.
- **Files:** `apps/www/lib/db/schema.ts`, `apps/www/lib/auth.ts`, `apps/www/drizzle/0002_restore_nextauth_plural.sql`.
- **Follow-ups:** Run the new migration (`pnpm --filter www run db:migrate`) to flip any databases that already applied the singular-table migration back to the plural naming before retesting authentication.
