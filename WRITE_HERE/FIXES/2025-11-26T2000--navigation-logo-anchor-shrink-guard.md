# Navigation logo anchor shrink guard
- **What:** Prevented the navigation logo link from shrinking within the flex header so the wordmark keeps the same size across locales.
- **Why:** The Dutch navigation labels pushed the flex row tight and the anchor was still allowed to shrink, crushing the logo despite the image wrapper using `shrink-0`.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** Capture updated navigation screenshots once the site can run locally without missing dependencies.
