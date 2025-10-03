# Randomized hours saved scheduler refinements

- **What:** Spread hourly additions across randomized minute-level updates, expose zero-amount placeholders, and refresh the staff editor with quick controls and translations.
- **Why:** Prevent the ticker from jumping in a single lump and make it faster for staff to tune day/night automation.
- **Files:** `apps/www/lib/hours-saved/*`, `apps/www/app/[locale]/(site)/dashboard/*`, `apps/www/messages/*`.
- **Follow-ups:** Consider adding integration coverage once database migrations for hours-saved tables run in production.
