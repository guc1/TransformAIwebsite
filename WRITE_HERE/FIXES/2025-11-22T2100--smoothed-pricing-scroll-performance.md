# Smoothed pricing scroll performance
- **What:** Swapped the global mouse tracking in the pricing particles and shiny card group for scoped pointer listeners with rAF-throttled updates so the hover effects update without forcing repeated React renders.
- **Why:** The pricing page lagged during scroll because every mousemove triggered React state updates across the page, causing expensive layout reads on each frame.
- **Files:** `apps/www/components/particles.tsx`, `apps/www/components/shiny-card.tsx`.
- **Follow-ups:** Monitor the hover gradients after major layout shifts; the resize observer will keep offsets in sync, but additional cards may need a refresh toggle if they mount asynchronously.
