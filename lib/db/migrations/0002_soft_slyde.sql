ALTER TABLE "users" DROP CONSTRAINT "users_api_key_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "api_key";