# Ensure auth redirects read live session state

## What
- Marked the auth gating pages and the members hub as `force-dynamic` so they run on every request.
- Prevented Next.js from caching static versions of sign-in flows that ignored fresh session cookies.

## Why
- Post-sign-in traffic kept looping back to the sign-in form because the pages were prerendered without a session.
- Forcing dynamic rendering lets the server see the new session token and redirect members into their hub.

## Files
- apps/www/app/[locale]/(site)/auth/post-signin/page.tsx
- apps/www/app/[locale]/(site)/create-account/page.tsx
- apps/www/app/[locale]/(site)/members/page.tsx
- apps/www/app/[locale]/(site)/sign-in/page.tsx

## Follow-ups
- Monitor for any additional pages that rely on per-request session state and mark them dynamic if needed.
