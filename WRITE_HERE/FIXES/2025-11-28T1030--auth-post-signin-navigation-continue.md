# Fix post-sign-in redirect locale duplication and add account chooser
- **What:** Ensured auth flows route through the locale-aware post-sign-in page without duplicating the locale segment, added cookie-backed account history tracking, and surfaced "continue as" cards in the members menu.
- **Why:** Signing up pushed visitors to `/en/en/auth/post-signin`, yielding a blank screen, and returning members lacked a quick way to jump back into their active accounts from the navigation.
- **Files:** `apps/www/app/[locale]/(site)/auth/post-signin/*`, `apps/www/components/auth/sign-in-form.tsx`, `apps/www/components/auth/sign-up-form.tsx`, `apps/www/components/navbar/navigation.tsx`, `apps/www/hooks/use-account-history.ts`, `apps/www/lib/account-history.ts`, `apps/www/messages/{en,nl}.json`.
- **Follow-ups:** Consider clearing the signup intent cookie once consumed and explore persisting account avatars to enhance the chooser.
