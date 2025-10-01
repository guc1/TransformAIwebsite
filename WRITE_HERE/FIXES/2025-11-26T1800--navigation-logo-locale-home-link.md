# Restored locale-aware navigation logo
- **What:** Pointed the header logo and mobile home entry to the active locale's root route so the TransformAI mark behaves as a working home icon in Dutch.
- **Why:** The Dutch locale still routed the logo tap to the default path, leaving users stuck outside their language.
- **Files:** `apps/www/components/navbar/navigation.tsx`, `apps/www/components/navbar/link.tsx`.
- **Follow-ups:** Audit other manual "/" links if new locales are introduced.
