# Restore Members menu compile

- **What:** Replaced the members popover className string with `cn()` composition so JSX parses correctly during Next.js builds.
- **Why:** A multiline attribute string introduced an unexpected token error (`<div>`) that prevented the navigation component from compiling.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** None.
