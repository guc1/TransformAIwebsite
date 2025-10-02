# Restore visitor session tracking without layout cookie mutation

- **What:** Replaced the layout-level `cookies().set` call with a client-side initializer that posts to a dedicated `/api/visitor-sessions` route, which records the visit and sets the tracking cookie legally. Shared cookie constants across server and client and reused the logging helper.
- **Why:** Next.js forbids mutating cookies directly inside layouts, causing runtime crashes on the staff dashboard. The new API route + client bootstrap keeps analytics functional without violating framework constraints.
- **Files:** `apps/www/app/[locale]/layout.tsx`, `apps/www/app/visitor-session-initializer.tsx`, `apps/www/app/api/visitor-sessions/route.ts`, `apps/www/lib/visitors.ts`, `apps/www/lib/visitors/constants.ts`.
- **Follow-ups:** Consider batching visitor writes or adding bot filtering once production traffic patterns are known.
