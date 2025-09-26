# Moved locale persistence route to API and updated selection flow
_When:_ 2025-09-21 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- Moved the locale persistence route to `/api/select-language` so the language picker page can serve GET requests without a 405 error.
- Updated the selection form to post against the new endpoint while keeping the redirect into the chosen locale.
