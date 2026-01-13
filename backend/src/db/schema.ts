import {
  pgTable,
  text,
  varchar,
  timestamp,
  unique,
  serial,
  foreignKey,
  integer,
  jsonb,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { primaryKey } from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["superadmin", "admin", "analyste"]);

export const invitation = pgTable("invitation", {
  tokenHash: varchar("tokenHash", { length: 64 }).primaryKey().notNull(),
  email: varchar({ length: 255 }).notNull(),
  role: role().notNull(),
  expireAt: timestamp("expireAt", { mode: "string" }).notNull(),
  nom: varchar({ length: 100 }),
  prenom: varchar({ length: 100 }),
  num: varchar({ length: 100 }),
  botIds: integer("botsId").array(),
});

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    role: role().notNull(),
    mfaSecret: text("mfa_secret"),
    motdepasse: text().notNull(),
    nom: varchar({ length: 100 }),
    prenom: varchar({ length: 100 }),
    num: varchar({ length: 100 }),
  },
  (table) => [unique("users_email_key").on(table.email)]
);

export const bots = pgTable(
  "bots",
  {
    idBot: serial("id_bot").primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    status: varchar({ length: 100 }),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    ownerId: integer("owner_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
      name: "bots_owner_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const userBot = pgTable(
  "userBot",
  {
    userId : integer("userId").references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    botId: integer("botId").references(() => bots.idBot, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
       primaryKey({ columns: [table.userId, table.botId] })
  ]
);

export const conversation = pgTable(
  "conversation",
  {
    idConversation: serial("id_conversation").primaryKey().notNull(),
    botId: integer("bot_id"),
    startedAt: timestamp("started_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    local: varchar({ length: 10 }),
  },
  (table) => [
    foreignKey({
      columns: [table.botId],
      foreignColumns: [bots.idBot],
      name: "conversation_bot_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const botConfigs = pgTable(
  "bot_configs",
  {
    cnfigId: serial("cnfig_id").primaryKey().notNull(),
    generalJson: jsonb("general_json"),
    designeJson: jsonb("designe_json"),
    behaviorJson: jsonb("behavior_json"),
    sourcesJson: jsonb("sources_json"),
    fromJson: jsonb("from_json"),
    botId: integer("bot_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.botId],
      foreignColumns: [bots.idBot],
      name: "bot_configs_bot_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const messages = pgTable(
  "messages",
  {
    idMessages: serial("id_messages").primaryKey().notNull(),
    conversationId: integer("conversation_id"),
    content: text(),
    sourcesJson: jsonb("sources_json"),
    latencyMs: integer("latency_ms"),
  },
  (table) => [
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversation.idConversation],
      name: "messages_conversation_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const statisticsDaily = pgTable(
  "statistics_daily",
  {
    statisticsId: serial("statistics_id").primaryKey().notNull(),
    botId: integer("bot_id"),
    data: date().notNull(),
    sessions: integer(),
    escalations: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.botId],
      foreignColumns: [bots.idBot],
      name: "statistics_daily_bot_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id"),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "refresh_tokens_user_id_fkey",
    }).onDelete("cascade"),
  ]
);
