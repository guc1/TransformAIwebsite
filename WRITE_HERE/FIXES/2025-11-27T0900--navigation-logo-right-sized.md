# Navigation logo right-sized across locales
- **What:** Reduced the responsive width presets on the header logo so the TransformAI wordmark renders at a balanced scale in both English and Dutch navigation layouts.
- **Why:** After preventing flex shrink, the wider locale labels left the logo visually oversized; dialing the widths back keeps the mark prominent without overpowering the menu.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** Capture updated header screenshots once the Next.js workspace runs with the missing `next-intl` dependency.
