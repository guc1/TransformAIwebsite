# Resolved GET select-language 405 error
_When:_ 2025-09-21 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Visiting `/select-language` produced an HTTP 405 instead of rendering the language picker because the request hit the cookie-setting route.
- **Root cause:** Next.js prioritized the colocated `route.ts` (with only a `POST` handler) over the page component, so GET requests never reached the React page.
- **Fix:**
  - Moved the locale persistence handler to `/api/select-language` so the `/select-language` page can serve GET traffic normally.
  - Pointed the selection form at the new endpoint, retaining the redirect logic after setting the locale cookie.
- **Files:** `apps/www/app/api/select-language/route.ts`, `apps/www/app/select-language/page.tsx`
- **Follow-ups:** None.
