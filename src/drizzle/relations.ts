import { relations } from "drizzle-orm/relations";
import { resource, users, session, practiceSessions, questions, otpVerification, resetTokens, practiceSessionQuestionsTable } from "./schema";

export const resourceRelations = relations(resource, ({one, many}) => ({
	resource: one(resource, {
		fields: [resource.parentId],
		references: [resource.id],
		relationName: "resource_parentId_resource_id"
	}),
	resources: many(resource, {
		relationName: "resource_parentId_resource_id"
	}),
	user: one(users, {
		fields: [resource.userId],
		references: [users.id]
	}),
	practiceSessions: many(practiceSessions),
	questions: many(questions),
}));

export const usersRelations = relations(users, ({many}) => ({
	resources: many(resource),
	sessions: many(session),
	otpVerifications: many(otpVerification),
	resetTokens: many(resetTokens),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(users, {
		fields: [session.userId],
		references: [users.id]
	}),
}));

export const practiceSessionsRelations = relations(practiceSessions, ({one, many}) => ({
	resource: one(resource, {
		fields: [practiceSessions.noteId],
		references: [resource.id]
	}),
	practiceSessionQuestionsTables: many(practiceSessionQuestionsTable),
}));

export const questionsRelations = relations(questions, ({one, many}) => ({
	resource: one(resource, {
		fields: [questions.noteId],
		references: [resource.id]
	}),
	practiceSessionQuestionsTables: many(practiceSessionQuestionsTable),
}));

export const otpVerificationRelations = relations(otpVerification, ({one}) => ({
	user: one(users, {
		fields: [otpVerification.userId],
		references: [users.id]
	}),
}));

export const resetTokensRelations = relations(resetTokens, ({one}) => ({
	user: one(users, {
		fields: [resetTokens.userId],
		references: [users.id]
	}),
}));

export const practiceSessionQuestionsTableRelations = relations(practiceSessionQuestionsTable, ({one}) => ({
	practiceSession: one(practiceSessions, {
		fields: [practiceSessionQuestionsTable.practiceSessionId],
		references: [practiceSessions.id]
	}),
	question: one(questions, {
		fields: [practiceSessionQuestionsTable.questionId],
		references: [questions.id]
	}),
}));