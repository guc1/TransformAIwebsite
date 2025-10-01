# Restore animated mainboard on Next build

- **What:** Served the animated `mainbordtransform.svg` from `public` and updated hero imports to reference the static URL with explicit dimensions.
- **Why:** Next.js failed to compile because the in-bundle SVG import was considered invalid after adding animation styles; treating it as a static asset unblocks the build while preserving motion.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/hero/hero.tsx`, `apps/www/public/images/logos/transformai/mainbordtransform.svg`.
- **Follow-ups:** Consider optimising the SVG to reduce its payload and re-introduce module imports once compatible with Next image metadata parsing.
