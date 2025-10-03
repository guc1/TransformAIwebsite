# Stabilized hero hours-saved ticker hydration

- **What:** Passed the server-formatted hours-saved total into the hero ticker and deferred client-side number formatting until after hydration so the initial markup stays consistent across environments.
- **Why:** The ticker formatted values with Intl during SSR and again in the browser, which could diverge for locales with different ICU data and triggered hydration errors.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/hero/hero.tsx`, `apps/www/components/hero/hero-main-section.tsx`, `apps/www/components/hero/hours-saved-ticker.tsx`.
- **Follow-ups:** Consider reusing the deferred-formatting pattern anywhere client components still rely on Intl for initial renders.
