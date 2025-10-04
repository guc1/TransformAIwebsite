# Ensure members menu respects account destinations
- **What:** Added per-account destination tracking to the account history cookie and updated the members menu to use those stored paths when navigating, refreshing the cookie when a saved account is selected.
- **Why:** Previously every saved account entry pointed to the same default route, so selecting different profiles from the menu always opened the same page instead of the correct member or staff workspace.
- **Files:** `apps/www/lib/account-history.ts`, `apps/www/components/navbar/navigation.tsx`, `apps/www/app/[locale]/(site)/auth/post-signin/redirect-gate.tsx`.
- **Follow-ups:** Consider surfacing account-specific metadata (e.g., avatars) now that destinations are tracked.
