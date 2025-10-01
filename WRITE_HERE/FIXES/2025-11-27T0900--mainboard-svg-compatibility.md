# Restore TransformAI board SVG compatibility
- **What:** Served the animated `mainbordtransform.svg` from `public/` and updated hero imports to use a direct path so Next.js can render it without parsing errors.
- **Why:** The previous static import caused Next.js to reject the SVG as an invalid image, preventing the page from compiling.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/hero/hero.tsx`, `apps/www/public/images/logos/transformai/mainbordtransform.svg`.
- **Follow-ups:** Consider cleaning up other legacy board assets under `apps/www/images/logos/transformai/` if they remain unused.
