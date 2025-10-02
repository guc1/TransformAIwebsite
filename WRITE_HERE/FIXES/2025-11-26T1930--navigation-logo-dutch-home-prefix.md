# Dutch navigation logo visible again
- **What:** Reverted the header logo and mobile home links to use the locale-aware navigation helpers with root (`"/"`) paths so next-intl prefixes them correctly instead of doubling the locale segment.
- **Why:** The prior fix hard-coded `/${locale}` which `next-intl` prefixed again, breaking the Dutch home link and leaving the logo image unloaded on the resulting 404 route.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** None.
