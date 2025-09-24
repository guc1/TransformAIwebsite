# Centered pricing info tooltips within the viewport
_When:_ 2025-11-22 17:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Adjusted the pricing info tooltip alignment to anchor toward the interior of the layout and added collision padding so the panel stays fully visible on hover.
- **Why:** Prevent the coverage summary overlay from spilling off-screen on the right side of the table and ensure it feels visually centered within the comparison surface.
- **Files:** `apps/www/components/pricing/pricing-compare-table.tsx`.
- **Follow-ups:** Validate on-device that touch interactions remain comfortable; consider promoting the tooltip content into a dedicated modal if deeper detail is needed.
