# Stabilize members redirect after account switch
- **What:** Disabled prefetching on recent-account links and forced a router refresh after post-sign-in redirects so cached client-side responses cannot override the intended destination.
- **Why:** Selecting a saved staff profile or finishing sign-in briefly navigated to the correct dashboard before a cached redirect sent the browser back to `/en/newsupdates`.
- **Files:** `apps/www/components/navbar/navigation.tsx`, `apps/www/app/[locale]/(site)/auth/post-signin/redirect-gate.tsx`.
- **Follow-ups:** None.
