-- Ensure NextAuth tables and columns use the original plural snake_case names
DO $$
BEGIN
  IF to_regclass('public."user"') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'emailVerified'
    ) THEN
      EXECUTE 'ALTER TABLE "user" RENAME COLUMN "emailVerified" TO "email_verified"';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'passwordHash'
    ) THEN
      EXECUTE 'ALTER TABLE "user" RENAME COLUMN "passwordHash" TO "password_hash"';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'createdAt'
    ) THEN
      EXECUTE 'ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at"';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'updatedAt'
    ) THEN
      EXECUTE 'ALTER TABLE "user" RENAME COLUMN "updatedAt" TO "updated_at"';
    END IF;

    IF to_regclass('public.user_email_unique') IS NOT NULL THEN
      EXECUTE 'ALTER INDEX "user_email_unique" RENAME TO "users_email_unique"';
    END IF;

    IF to_regclass('public.user_role_idx') IS NOT NULL THEN
      EXECUTE 'ALTER INDEX "user_role_idx" RENAME TO "users_role_idx"';
    END IF;

    EXECUTE 'ALTER TABLE "user" RENAME TO "users"';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.account') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'userId'
    ) THEN
      EXECUTE 'ALTER TABLE "account" RENAME COLUMN "userId" TO "user_id"';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'providerAccountId'
    ) THEN
      EXECUTE 'ALTER TABLE "account" RENAME COLUMN "providerAccountId" TO "provider_account_id"';
    END IF;

    IF to_regclass('public.account_userId_idx') IS NOT NULL THEN
      EXECUTE 'ALTER INDEX "account_userId_idx" RENAME TO "accounts_user_id_idx"';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_schema = 'public'
        AND table_name = 'account'
        AND constraint_name = 'account_userId_user_id_fk'
    ) THEN
      EXECUTE 'ALTER TABLE "account" RENAME CONSTRAINT "account_userId_user_id_fk" TO "accounts_user_id_users_id_fk"';
    END IF;

    EXECUTE 'ALTER TABLE "account" RENAME TO "accounts"';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.session') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'sessionToken'
    ) THEN
      EXECUTE 'ALTER TABLE "session" RENAME COLUMN "sessionToken" TO "session_token"';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'userId'
    ) THEN
      EXECUTE 'ALTER TABLE "session" RENAME COLUMN "userId" TO "user_id"';
    END IF;

    IF to_regclass('public.session_userId_idx') IS NOT NULL THEN
      EXECUTE 'ALTER INDEX "session_userId_idx" RENAME TO "sessions_user_id_idx"';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_schema = 'public'
        AND table_name = 'session'
        AND constraint_name = 'session_userId_user_id_fk'
    ) THEN
      EXECUTE 'ALTER TABLE "session" RENAME CONSTRAINT "session_userId_user_id_fk" TO "sessions_user_id_users_id_fk"';
    END IF;

    EXECUTE 'ALTER TABLE "session" RENAME TO "sessions"';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public."verificationToken"') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE "verificationToken" RENAME TO "verification_tokens"';
  END IF;
END $$;
