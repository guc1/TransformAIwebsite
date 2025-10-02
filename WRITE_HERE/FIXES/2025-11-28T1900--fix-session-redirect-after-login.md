# Fix session redirect after login

- **What:** Ensure we hydrate the NextAuth session with an ID/role lookup so authenticated users land on their role-aware destinations instead of looping back to the sign-in view.
- **Why:** The post-sign-in guard relied on `session.user.id`, but the session payload coming back from the database strategy omitted it, causing `resolveSessionRedirect` to return `null` and bounce users to `/sign-in`.
- **Files:**
  - `apps/www/lib/auth-redirect.ts`
  - `apps/www/app/[locale]/(site)/auth/post-signin/page.tsx`
  - `apps/www/app/[locale]/(site)/create-account/page.tsx`
  - `apps/www/app/[locale]/(site)/sign-in/page.tsx`
- **Follow-ups:** Consider persisting the enriched session payload in a cookie to avoid redundant database lookups once the broader auth refactor lands.
