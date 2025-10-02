# Post-sign-in locale redirects stay single-prefixed
- **What:** Normalized post-sign-in navigation to pass locale-neutral paths through the i18n router so it re-applies the active locale instead of duplicating it.
- **Why:** Logging in from localized routes was producing `/en/en/...` URLs because client navigations forwarded already-prefixed paths into the locale-aware router.
- **Files:** `apps/www/app/[locale]/(site)/auth/post-signin/page.tsx`, `apps/www/app/[locale]/(site)/auth/post-signin/redirect-gate.tsx`, `apps/www/components/auth/sign-in-form.tsx`.
- **Follow-ups:** Monitor other client navigations that might supply locale-prefixed paths and reuse the new helper if additional surfaces crop up.
