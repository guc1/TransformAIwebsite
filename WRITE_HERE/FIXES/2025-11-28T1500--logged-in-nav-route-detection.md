# Logged-in navigation route detection
- **What:** Corrected the logged-in header so member and staff pages show the simplified logo + exit + current page + coming-soon layout.
- **Why:** The previous implementation never activated because the pathname comparison still expected locale-prefixed routes, leaving the default marketing navigation visible after signing in.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** None; future member/staff sections can reuse the helper once their pages are live.
