# Clear existing session before new sign-in attempts

- **What:** Updated the sign-in form to call `signOut` before attempting either credentials or Google authentication so the new login replaces any active session.
- **Why:** Without clearing the previous session, trying to switch between staff and member accounts in the same browser session kept redirecting back to the most recently active account, preventing users from returning to their earlier role.
- **Files:** `apps/www/components/auth/sign-in-form.tsx`
- **Follow-ups:** Consider adding explicit “Sign out” affordances near account switchers so users can intentionally end a session before selecting another saved account.
