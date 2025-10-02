DO $$
BEGIN
  ALTER TABLE "sessions" RENAME TO "session";
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER INDEX "sessions_user_id_idx" RENAME TO "session_user_id_idx";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "session" RENAME CONSTRAINT "sessions_user_id_users_id_fk" TO "session_user_id_users_id_fk";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
