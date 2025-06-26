import { pgTable, foreignKey, text, uuid, jsonb, integer, timestamp, boolean, real, index, unique, serial, uniqueIndex, varchar, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const questionType = pgEnum("question_type", ['free-form'])
export const resourceType = pgEnum("resource_type", ['practice-note', 'folder'])


export const resource = pgTable("resource", {
	id: text().primaryKey().notNull(),
	resourceType: resourceType("resource_type").notNull(),
	parentId: text("parent_id"),
	userId: uuid("user_id").notNull(),
	properties: jsonb().notNull(),
	version: integer(),
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

export const practiceSessions = pgTable("practice_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	noteId: text("note_id").notNull(),
	title: text().notNull(),
	completed: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.noteId],
			foreignColumns: [resource.id],
			name: "practice_sessions_note_id_resource_id_fk"
		}).onDelete("cascade"),
]);

export const questions = pgTable("questions", {
	id: text().primaryKey().notNull(),
	noteId: text("note_id").notNull(),
	repetitions: integer().default(0).notNull(),
	interval: integer().default(1).notNull(),
	easiness: real().default(2.5).notNull(),
	type: questionType().notNull(),
	details: jsonb().notNull(),
	version: integer().notNull(),
	correctAnswer: jsonb("correct_answer").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.noteId],
			foreignColumns: [resource.id],
			name: "questions_note_id_resource_id_fk"
		}).onDelete("cascade"),
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

export const practiceSessionQuestionsTable = pgTable("practice_session_questions_table", {
	practiceSessionId: uuid("practice_session_id").notNull(),
	questionId: text("question_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.practiceSessionId],
			foreignColumns: [practiceSessions.id],
			name: "practice_session_questions_table_practice_session_id_practice_s"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "practice_session_questions_table_question_id_questions_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.practiceSessionId, table.questionId], name: "practice_session_questions_table_practice_session_id_question_i"}),
]);
