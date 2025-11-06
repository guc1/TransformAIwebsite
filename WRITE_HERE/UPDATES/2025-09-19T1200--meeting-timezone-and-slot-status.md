# Added timezone selection and taken slot display to meeting scheduler
- **What:** Introduced a timezone selector with Amsterdam default and showed booked slots beneath available options with red styling. Updated slot formatting to 24-hour time with am/pm suffix and extended meeting constants/translations.
- **Why:** Users need to understand availability in their local timezone and clearly see which blocks are already taken while aligning with requested 24-hour display.
- **Files:** `apps/www/app/[locale]/(site)/meeting/components/scheduler.tsx`, `apps/www/lib/meetings/constants.ts`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Consider expanding timezone options or using geolocation defaults in future iterations.
