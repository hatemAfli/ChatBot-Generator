import { relations } from "drizzle-orm/relations";
import { users, bots, conversation, botConfigs, messages, statisticsDaily, refreshTokens } from "./schema";

export const botsRelations = relations(bots, ({one, many}) => ({
	user: one(users, {
		fields: [bots.ownerId],
		references: [users.id]
	}),
	conversations: many(conversation),
	botConfigs: many(botConfigs),
	statisticsDailies: many(statisticsDaily),
}));

export const usersRelations = relations(users, ({many}) => ({
	bots: many(bots),
	refreshTokens: many(refreshTokens),
}));

export const conversationRelations = relations(conversation, ({one, many}) => ({
	bot: one(bots, {
		fields: [conversation.botId],
		references: [bots.idBot]
	}),
	messages: many(messages),
}));

export const botConfigsRelations = relations(botConfigs, ({one}) => ({
	bot: one(bots, {
		fields: [botConfigs.botId],
		references: [bots.idBot]
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	conversation: one(conversation, {
		fields: [messages.conversationId],
		references: [conversation.idConversation]
	}),
}));

export const statisticsDailyRelations = relations(statisticsDaily, ({one}) => ({
	bot: one(bots, {
		fields: [statisticsDaily.botId],
		references: [bots.idBot]
	}),
}));

export const refreshTokensRelations = relations(refreshTokens, ({one}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id]
	}),
}));