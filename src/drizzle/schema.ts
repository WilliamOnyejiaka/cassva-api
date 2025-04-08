import { pgTable, uniqueIndex, unique, uuid, varchar, timestamp, text, index, foreignKey, serial, jsonb, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const questionType = pgEnum("question_type", ['free-form', 'multiple-select', 'single-select'])
export const resourceType = pgEnum("resource_type", ['practice-note', 'folder'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar(),
	emailVerified: timestamp({ mode: 'string' }),
	googleId: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
	unique("users_googleId_unique").on(table.googleId),
]);

export const otpVerification = pgTable("otp-verification", {
	id: serial().primaryKey().notNull(),
	userId: uuid().notNull(),
	token: text().notNull(),
	tokenExpiresAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("verify_email_tokens_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "otp-verification_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("otp-verification_userId_unique").on(table.userId),
]);

export const resource = pgTable("resource", {
	id: text().primaryKey().notNull(),
	resourceType: resourceType("resource_type").notNull(),
	parentId: text("parent_id"),
	userId: uuid("user_id"),
	properties: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "resource_parent_id_resource_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "resource_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const questions = pgTable("questions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	noteId: text("note_id").notNull(),
	repetitions: integer().default(0),
	interval: integer().default(1),
	easiness: integer().default(2.5),
	type: questionType().notNull(),
	details: jsonb().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.noteId],
			foreignColumns: [resource.id],
			name: "questions_note_id_resource_id_fk"
		}).onDelete("cascade"),
]);

export const resetTokens = pgTable("reset-tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	token: text().notNull(),
	tokenExpiresAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("reset_tokens_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reset-tokens_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("reset-tokens_userId_unique").on(table.userId),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

// export const tbls: Record<string, ReturnType<typeof pgTable>> = {
// 	users: users,
// 	"otp-verification": otpVerification,
// 	resource,
// 	questions,
// 	"reset-tokens": resetTokens,
// 	session,
// };