# Ensured founder body copy renders from translations

- **What:** Updated the About page to pull the founder body copy directly from the locale messages and parse embedded highlight tags so the section renders paragraphs instead of showing the `About.Founder.body` key.
- **Why:** After restoring the historic founder copy, the page was outputting the translation key because the plain translator lookup no longer returned the localized string.
- **Files:** `apps/www/app/[locale]/(site)/about/page.tsx`.
- **Follow-ups:** Consider extracting a shared rich-copy helper if other sections need highlight parsing in the future.
