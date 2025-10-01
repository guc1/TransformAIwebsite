# Restore Dutch navigation logo scale
- **What:** Prevented the header logo from shrinking inside the Dutch navigation layout by making the wordmark a non-flexible item.
- **Why:** Longer Dutch navigation labels squeezed the flex container and collapsed the logo width, leaving it far smaller than on the English locale.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** None.
