# Fix Dutch navigation logo shrinkage
- **What:** Prevented the header logo from shrinking in flex layouts by adding a `shrink-0` utility to the shared navigation logo wrapper.
- **Why:** The longer Dutch CTA labels squeezed the flex row, causing the TransformAI logo to shrink dramatically in the top navigation bar.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** Capture updated header screenshots once the environment supports running the Next.js app locally.
