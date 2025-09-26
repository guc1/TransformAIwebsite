# Wrapped Next config with next-intl and centralized message loading
_When:_ 2025-09-22 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- Wrapped the Next.js config with the `next-intl` plugin and centralized message loading so runtime translations inherit English fallbacks without throwing.
- Returned a 303 from `/api/select-language` to convert the follow-up request into a GET and land visitors on the chosen locale.
