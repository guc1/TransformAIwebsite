# Removed literal `<br/><br/>` sequences from founder story
- **What:** Normalized the founder story translation to use paragraph breaks instead of embedded HTML and updated the about page to render clean line breaks whether translations use newlines or legacy `<br/>` markers.
- **Why:** The about page was showing the raw `<br/><br/>` text to visitors in both English and Dutch instead of splitting the copy into separate paragraphs.
- **Files:** `apps/www/app/[locale]/(site)/about/page.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`
- **Follow-ups:** None.
