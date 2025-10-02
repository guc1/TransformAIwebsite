# Ensure clients land on news updates after signing in
- **What:** Added a shared session redirect helper and guarded the sign-in, create-account, and post-sign-in routes so authenticated users go straight to their dashboard or the client news updates feed.
- **Why:** After logging in, members were dropped back on the sign-in form instead of being routed to the protected news updates area, making it appear that authentication failed.
- **Files:** `apps/www/app/[locale]/(site)/auth/post-signin/page.tsx`, `apps/www/app/[locale]/(site)/sign-in/page.tsx`, `apps/www/app/[locale]/(site)/create-account/page.tsx`, `apps/www/lib/auth-redirect.ts`.
- **Follow-ups:** Once deployed, verify both staff and client accounts redirect correctly and that the staff intent cookie is cleared after use.
