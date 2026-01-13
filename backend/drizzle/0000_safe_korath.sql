CREATE TYPE "public"."role" AS ENUM('superadmin', 'admin', 'analyste');--> statement-breakpoint
CREATE TABLE "bot_configs" (
	"cnfig_id" serial PRIMARY KEY NOT NULL,
	"general_json" jsonb,
	"designe_json" jsonb,
	"behavior_json" jsonb,
	"sources_json" jsonb,
	"from_json" jsonb,
	"bot_id" integer
);
--> statement-breakpoint
CREATE TABLE "bots" (
	"id_bot" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"status" varchar(100),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"owner_id" integer
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id_conversation" serial PRIMARY KEY NOT NULL,
	"bot_id" integer,
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"local" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"tokenHash" varchar(64) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "role" NOT NULL,
	"expireAt" timestamp NOT NULL,
	"nom" varchar(100),
	"prenom" varchar(100),
	"num" varchar(100),
	"botsId" integer[]
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id_messages" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer,
	"content" text,
	"sources_json" jsonb,
	"latency_ms" integer
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "statistics_daily" (
	"statistics_id" serial PRIMARY KEY NOT NULL,
	"bot_id" integer,
	"data" date NOT NULL,
	"sessions" integer,
	"escalations" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "role" NOT NULL,
	"mfa_secret" text,
	"motdepasse" text NOT NULL,
	"nom" varchar(100),
	"prenom" varchar(100),
	"num" varchar(100),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bot_configs" ADD CONSTRAINT "bot_configs_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id_bot") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bots" ADD CONSTRAINT "bots_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id_bot") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id_conversation") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistics_daily" ADD CONSTRAINT "statistics_daily_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id_bot") ON DELETE cascade ON UPDATE no action;