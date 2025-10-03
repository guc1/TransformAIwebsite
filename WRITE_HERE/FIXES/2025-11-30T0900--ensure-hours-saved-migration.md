# Restore hours-saved schema for randomized ticker

- **What:** Added a defensive migration that creates the hours saved tables when missing, backfills required columns like `scheduled_for`, and reinstates the foreign key and indexes used by the randomized ticker.
- **Why:** The homepage crashed because Postgres lacked the `scheduled_for` column the ticker now queries, so the new automation could not load.
- **Files:** `apps/www/drizzle/0003_hours_saved_tables.sql`
- **Follow-ups:** Run the new migration in each environment and confirm future schema tweaks ship with migrations alongside Drizzle models.
