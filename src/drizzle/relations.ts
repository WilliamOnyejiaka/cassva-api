import { relations } from "drizzle-orm/relations";
import { users, otpVerification, resource, questions, resetTokens, session } from "./schema";

export const otpVerificationRelations = relations(otpVerification, ({one}) => ({
	user: one(users, {
		fields: [otpVerification.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	otpVerifications: many(otpVerification),
	resources: many(resource),
	resetTokens: many(resetTokens),
	sessions: many(session),
}));

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
	questions: many(questions),
}));

export const questionsRelations = relations(questions, ({one}) => ({
	resource: one(resource, {
		fields: [questions.noteId],
		references: [resource.id]
	}),
}));

export const resetTokensRelations = relations(resetTokens, ({one}) => ({
	user: one(users, {
		fields: [resetTokens.userId],
		references: [users.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(users, {
		fields: [session.userId],
		references: [users.id]
	}),
}));