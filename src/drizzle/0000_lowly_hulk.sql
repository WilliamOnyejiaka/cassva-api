-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."question_type" AS ENUM('free-form', 'multiple-select', 'single-select');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('practice-note', 'folder');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar,
	"emailVerified" timestamp,
	"googleId" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_googleId_unique" UNIQUE("googleId")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "otp-verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"token" text NOT NULL,
	"tokenExpiresAt" timestamp NOT NULL,
	CONSTRAINT "otp-verification_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "otp-verification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "resource" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"parent_id" text,
	"user_id" uuid,
	"properties" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resource" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" text NOT NULL,
	"repetitions" integer DEFAULT 0,
	"interval" integer DEFAULT 1,
	"easiness" integer DEFAULT 2.5,
	"type" "question_type" NOT NULL,
	"details" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reset-tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"token" text NOT NULL,
	"tokenExpiresAt" timestamp NOT NULL,
	CONSTRAINT "reset-tokens_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "reset-tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "otp-verification" ADD CONSTRAINT "otp-verification_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "resource_parent_id_resource_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resource"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "resource_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_note_id_resource_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."resource"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reset-tokens" ADD CONSTRAINT "reset-tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "verify_email_tokens_token_idx" ON "otp-verification" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "reset_tokens_token_idx" ON "reset-tokens" USING btree ("token" text_ops);
*/