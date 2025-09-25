# Fixed select-language redirect and missing html-body tags
_When:_ 2025-09-20 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Loading `/` produced a Next.js warning about missing `<html>`/`<body>` tags, and choosing a language on `/select-language` left the page instead of redirecting into the localized site.
- **Fix:**
  - Restored the root layout’s document wrapper, deriving the `lang` attribute from the `NEXT_LOCALE` cookie while keeping the locale layout focused on translations and shared chrome.
  - Reworked `app/[locale]/layout.tsx` to live inside the root `<html>/<body>` tree without duplicating markup.
  - Replaced the unreliable server action with a route handler that persists `NEXT_LOCALE` for one year and issues a redirect to the chosen locale, updating the selection page to post against it.
- **Files:** `apps/www/app/layout.tsx`, `apps/www/app/[locale]/layout.tsx`, `apps/www/app/select-language/page.tsx`, `apps/www/app/select-language/route.ts`
- **Follow-ups:** None.
