# Filtered blog posts by locale language
- **What:** Added a frontmatter `language` field for project blog posts, introduced helpers to normalize accepted language names, and filtered blog listings and article routes so content only appears for matching locales.
- **Why:** Ensure Dutch and English blog variants surface in the correct localized experience while keeping unspecified posts visible everywhere.
- **Files:** `apps/www/content-collections.ts`, `apps/www/lib/blog-language.ts`, `apps/www/app/[locale]/(site)/blog/page.tsx`, `apps/www/app/[locale]/(site)/blog/[slug]/page.tsx`, `apps/www/content/blog/mdxfilesforprojects/research/ai-adoptation/posts/Dutch/zo-meten-we-ai-adoptie-per-sector.mdx`, `apps/www/content/blog/mdxfilesforprojects/research/ai-adoptation/posts/English/how-we-map-ai-adoption-across-industries.mdx`.
- **Follow-ups:** Consider extending the alias map when new locales are added so language-based filtering stays accurate.
