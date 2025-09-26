# Refit analytics bento into TransformAI Beta Dashboard
_When:_ 2025-09-26 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Rework the analytics bento so every label, caption, and legend reflects an AI usage dashboard with English/Dutch translations and refreshed hero copy for the platform section.
- **Fix:**
  - Routed the sidebar, tabs, metrics, legends, and caption through new `Analytics` translation keys focused on AI adoption, keeping the existing grid structure intact.
  - Added platform hero strings under a `Platform` namespace and expanded the Dutch catalog with locale-appropriate number formatting while relying on English fallbacks.
- **Files:** `apps/www/components/analytics/analytics-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** Monitor for additional dashboard widgets that may need AI-focused copy.
