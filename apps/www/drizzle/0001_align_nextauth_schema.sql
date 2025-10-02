-- Align NextAuth tables with @auth/drizzle-adapter defaults
ALTER TABLE IF EXISTS "users" RENAME TO "user";
ALTER TABLE IF EXISTS "accounts" RENAME TO "account";
ALTER TABLE IF EXISTS "sessions" RENAME TO "session";
ALTER TABLE IF EXISTS "verification_tokens" RENAME TO "verificationToken";

ALTER TABLE IF EXISTS "user" RENAME COLUMN "email_verified" TO "emailVerified";
ALTER TABLE IF EXISTS "user" RENAME COLUMN "password_hash" TO "passwordHash";
ALTER TABLE IF EXISTS "user" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE IF EXISTS "user" RENAME COLUMN "updated_at" TO "updatedAt";

ALTER TABLE IF EXISTS "account" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE IF EXISTS "account" RENAME COLUMN "provider_account_id" TO "providerAccountId";

ALTER TABLE IF EXISTS "session" RENAME COLUMN "session_token" TO "sessionToken";
ALTER TABLE IF EXISTS "session" RENAME COLUMN "user_id" TO "userId";

ALTER INDEX IF EXISTS "users_email_unique" RENAME TO "user_email_unique";
ALTER INDEX IF EXISTS "users_role_idx" RENAME TO "user_role_idx";
ALTER INDEX IF EXISTS "accounts_user_id_idx" RENAME TO "account_userId_idx";
ALTER INDEX IF EXISTS "sessions_user_id_idx" RENAME TO "session_userId_idx";

ALTER TABLE IF EXISTS "account" RENAME CONSTRAINT "accounts_user_id_users_id_fk" TO "account_userId_user_id_fk";
ALTER TABLE IF EXISTS "session" RENAME CONSTRAINT "sessions_user_id_users_id_fk" TO "session_userId_user_id_fk";
