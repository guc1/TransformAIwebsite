# Transform hero uses updated board artwork
- **What:** Pointed the hero and homepage imports to the new `mainbordtransform.svg` asset that carries over the animated light beams.
- **Why:** The UI was still rendering the legacy `mainboard.svg`, so the refreshed artwork never appeared on the site.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/hero/hero.tsx`.
- **Follow-ups:** Remove the unused legacy `apps/www/images/mainboard.svg` asset once no longer needed anywhere else.
