CREATE TABLE "userBot" (
	"userId" integer NOT NULL,
	"botId" integer NOT NULL,
	CONSTRAINT "userBot_userId_botId_pk" PRIMARY KEY("userId","botId")
);
--> statement-breakpoint
ALTER TABLE "userBot" ADD CONSTRAINT "userBot_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userBot" ADD CONSTRAINT "userBot_botId_bots_id_bot_fk" FOREIGN KEY ("botId") REFERENCES "public"."bots"("id_bot") ON DELETE cascade ON UPDATE no action;