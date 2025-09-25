# Default unspecified blog language to English
- **What:** Tightened locale filtering so posts without a language frontmatter only render for the English locale and only generate English static params.
- **Why:** Template posts lacking a language tag were still visible in Dutch, so the list and article views kept English titles and descriptions when switching locales.
- **Files:** `apps/www/lib/blog-language.ts`.
- **Follow-ups:** Audit remaining content and tag each post with the right language as new locales launch.
