# Removed localhost base URL fallbacks

- **What**: Replaced hard-coded `http://localhost` fallbacks used for social sharing, sitemap generation, and the footer meeting link with domain-agnostic URLs powered by the configured `NEXT_PUBLIC_BASE_URL`. Also updated the playground API proxy helper to respect environment URLs instead of forcing localhost.
- **Why**: Localhost defaults were leaking into production redirects and share links, causing broken navigation whenever the deployed hostname differed from the development environment.
- **Files**: `apps/www/components/changelog/changelog-grid-item.tsx`, `apps/www/app/sitemap.ts`, `apps/www/components/footer/footer.tsx`, `apps/www/app/[locale]/(site)/templates/[slug]/opengraph-image.tsx`, `apps/www/app/[locale]/(site)/templates/[slug]/twitter-image.tsx`, `apps/www/app/[locale]/(site)/careers/[slug]/opengraph-image.tsx`, `apps/www/app/[locale]/(site)/careers/[slug]/twitter-image.tsx`, `apps/play/app/page.tsx`.
- **Follow-ups**: Ensure `NEXT_PUBLIC_BASE_URL` is set to the production domain in each environment.
