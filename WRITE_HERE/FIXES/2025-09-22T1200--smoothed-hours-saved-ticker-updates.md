# Smoothed hours saved ticker updates

- **What:** Randomized the homepage hours-saved ticker animation and gated it behind in-view detection so the value climbs in small bursts only when visible, while still catching up once the section returns to view.
- **Why:** The ticker previously jumped by large batches whenever new totals landed, which looked unnatural and failed to animate if the hero wasn't visible.
- **Files:** `apps/www/components/hero/hours-saved-ticker.tsx`
- **Follow-ups:** Consider reusing the randomized stepping utility if other counters adopt similar motion requirements.
