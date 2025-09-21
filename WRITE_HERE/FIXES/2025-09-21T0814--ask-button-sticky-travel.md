# Restored Ask CTA travel behavior

- **What:** Adjusted the sticky chat CTA layout to introduce top/bottom sentinels, reorder the CTA within its section, and reuse the sticky helper so the "Ask the TransformAI" button starts beneath the heading, scrolls with the user, and pins at the original stop.
- **Why:** The CTA rendered directly at its bottom stop and never traveled with scroll, breaking the intended interaction.
- **Files:** `apps/www/components/ask/StickyChat.tsx`
- **Follow-ups:** None.
