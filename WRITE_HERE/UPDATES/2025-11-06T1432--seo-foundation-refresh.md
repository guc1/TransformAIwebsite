# SEO foundation refresh for localized pages

- **What:** Updated localized metadata (title, description, Open Graph/Twitter) for English and Dutch, enforced canonical + hreflang structure with x-default to the language chooser, added organization JSON-LD, refreshed the language switcher to crawlable links, and aligned the sitemap/robots signals.
- **Why:** Implemented the requested SEO fixes so search engines and social platforms understand the /en and /nl variants, consolidate signals on the correct URLs, and present richer snippets for TransformAI.
- **Files:** `apps/www/app/[locale]/layout.tsx`, `apps/www/app/select-language/page.tsx`, `apps/www/app/sitemap.xml/route.ts`, `apps/www/components/language-switcher.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `middleware.ts`.
- **Follow-ups:** Validate the deployed robots.txt/sitemap endpoints in Search Console once live and localize any future metadata additions in both message catalogs.
