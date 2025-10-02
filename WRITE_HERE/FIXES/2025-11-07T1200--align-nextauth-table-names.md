# Align NextAuth tables with adapter expectations
_When:_ 2025-11-07 12:00 · _Scope:_ apps/www auth · _Author:_ AI assistant

- **What:** Renamed the NextAuth-related tables, columns, and indexes to the camelCase singular naming that `@auth/drizzle-adapter` queries while keeping schema references intact.
- **Why:** NextAuth session lookups failed because the adapter queried `session`/`userId` fields that did not exist in the snake_case plural tables created previously.
- **Files:** `apps/www/lib/db/schema.ts`, `apps/www/drizzle/0001_align_nextauth_schema.sql`.
- **Follow-ups:** Run the new migration in each environment (`pnpm --filter www run db:migrate`) so persisted data matches the updated schema before retesting auth.
