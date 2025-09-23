# Stabilized hero hours saved growth

- **What:** Re-tuned the hero hours-saved ticker to grow by a 1.01 daily factor, guard against backward ticks, and hide the baseline caption so only the live total and label remain.
- **Why:** The previous implementation compounded too aggressively, producing astronomically large totals and showing the baseline line the user asked to remove.
- **Files:** `apps/www/components/hours-saved-ticker.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** None.
