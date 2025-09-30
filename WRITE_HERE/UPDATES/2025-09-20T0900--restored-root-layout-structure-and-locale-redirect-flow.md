# Restored root layout structure and locale redirect flow
_When:_ 2025-09-20 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- Restored the root layout’s `<html>/<body>` structure, deriving the document language from the persisted locale cookie to silence Next.js warnings.
- Simplified the locale layout to render inside that wrapper and introduced a `/select-language` route handler that sets `NEXT_LOCALE` before redirecting visitors to the selected locale.
