# Ensure saved members accounts open their own destinations
- **What:** Updated the members menu account links to intercept clicks, close the menu, remember the account, and then hand the browser a full-page navigation to the localized destination. This bypasses Next.js's cached client redirect that previously replayed the members news feed after a staff selection. Both desktop and mobile menus now share the behavior.
- **Why:** Selecting a stored staff profile still jumped back to `/en/newsupdates` because the cached redirect response from a prior client visit kept firing. Forcing a fresh navigation ensures each account reaches its intended dashboard or members area.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** None.
