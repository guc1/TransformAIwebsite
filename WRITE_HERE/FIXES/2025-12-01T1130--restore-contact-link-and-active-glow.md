# Restore contact nav link visibility and active glow

- **What:** Ensured the top navigation renders the Contact destination across desktop and mobile link stacks and intensified the active-state glow logic using locale-aware path detection.
- **Why:** The previous header refresh regressed the visible Contact entry and the requested blue highlight was barely noticeable when selecting a page.
- **Files:** `apps/www/components/navbar/link.tsx`, `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** None.
