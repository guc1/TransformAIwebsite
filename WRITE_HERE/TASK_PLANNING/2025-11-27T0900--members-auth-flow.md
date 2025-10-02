# Members-only auth flow

## Scope
- Introduce database-backed auth with NextAuth + Drizzle/Postgres so visitors can register and sign in locally.
- Add members-only News Updates page (clients) and staff dashboard with role-based redirects.
- Replace external Unkey auth links with in-app Create Account & Sign In flows, including Google OAuth + email/password support.
- Document database setup/migrations and required env vars.

## Assumptions
- Postgres will be provisioned externally (e.g., Neon/Supabase); we just need connection string.
- Using NextAuth Credentials provider for email sign-in; no email verification requirement.
- Staff invite code remains static ("Cake2025") per request.
- News updates content can be static placeholder copy for now.

## Risks & Considerations
- NextAuth + Drizzle integration requires precise schema + callback wiring; ensure role info propagates to sessions.
- Handling Google staff onboarding needs cookie/intent handshake so roles are correct.
- Need to avoid leaking secrets via env parser; split client/server schemas.
- Ensure migrations + README guidance stay accurate without running actual DB in CI.
- UI must match existing aesthetic; check dark/light, responsive, translations.

## TODOs
- [ ] Add dependencies (`next-auth`, `@auth/drizzle-adapter`, `drizzle-orm`, `drizzle-kit`, `pg`, `bcryptjs`).
- [ ] Define Drizzle schema + config, create initial migration.
- [ ] Expand env schema + `.env.example` and README instructions.
- [ ] Build NextAuth config + API route, intent/register handlers.
- [ ] Implement create-account + sign-in pages, staff code handling, google/email flows.
- [ ] Add newsupdates + dashboard pages with role gating + counts.
- [ ] Update navigation CTA links + translations.
- [ ] Write update log, run lint/typecheck, capture screenshot.

## Testing Plan
- `pnpm --filter www run lint`
- `pnpm --filter www run typecheck`
- Manual: verify auth pages render (dev server) and role redirects in browser where possible.
