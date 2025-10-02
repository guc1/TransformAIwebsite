# Fix post-signin locale redirect

## What
- normalize locale-prefixed URLs before pushing navigation updates in the sign-in and sign-up flows so Next.js stops prefixing the locale twice
- add a shared client helper to drive locale-aware redirects after auth and a utility to detect locale prefixes in paths

## Why
- sign-in and registration returned a successful NextAuth response but the UI router re-added the locale segment, causing `/en/en/auth/post-signin` 404s and dumping users back on the form instead of reaching the news updates dashboard

## Files
- `apps/www/components/auth/auth-navigation.ts`
- `apps/www/components/auth/sign-in-form.tsx`
- `apps/www/components/auth/sign-up-form.tsx`
- `apps/www/lib/utils.ts`

## Follow-ups
- None
