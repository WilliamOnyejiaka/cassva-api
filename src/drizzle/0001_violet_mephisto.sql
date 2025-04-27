ALTER TABLE "otp-verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reset-tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "resource" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "easiness" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "version" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "version" integer;