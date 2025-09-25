# Recognize capitalized language frontmatter in blog posts
- **What:** Normalized blog collection parsing so posts using `Language:` frontmatter values still populate the `language` field for locale filtering.
- **Why:** Editors adding `Language: Dutch` or `Language: English` saw posts appear in every locale because the capitalized key was ignored.
- **Files:** `apps/www/content-collections.ts`.
- **Follow-ups:** None.
