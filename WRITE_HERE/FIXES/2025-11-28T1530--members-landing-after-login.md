# Restore member landing page after authentication
- **What:** Added a dedicated `/members` experience for authenticated clients with initiative cards and the curated news updates grid, and routed sign-ins there while keeping staff on the dashboard.
- **Why:** After logging in, clients stayed on the sign-in view and never saw the protected updates area meant for members.
- **Files:** `apps/www/app/[locale]/(site)/members/page.tsx`, `apps/www/app/[locale]/(site)/newsupdates/page.tsx`, `apps/www/components/members/member-updates-section.tsx`, `apps/www/lib/auth-redirect.ts`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Once deployed, verify locale-aware routing hits `/members` for clients and `/dashboard` for staff, and expand the members hub with live data sources when available.
