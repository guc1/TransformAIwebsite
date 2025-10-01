# TransformAI mainboard overlay
- **What:** Added a shared mainboard artwork component that layers the transparent TransformAI logo atop the circuit board asset and wired it into the hero and landing page instances so the Unkey mark is covered on all breakpoints.
- **Why:** The hero background still exposed the Unkey logo baked into the SVG; overlaying our transparent wordmark masks the original branding without losing the board effect the user liked.
- **Files:** `apps/www/components/hero/hero.tsx`, `apps/www/components/hero/mainboard-artwork.tsx`, `apps/www/app/[locale]/(site)/page.tsx`.
- **Follow-ups:** Verify overlay alignment once the dev environment includes the required `next-intl` dependency so the site can run locally.
