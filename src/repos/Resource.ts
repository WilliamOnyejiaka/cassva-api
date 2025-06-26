import { eq } from "drizzle-orm";
import db from "../config/drizzle";
import { resource, questions, questionType } from "../drizzle/schema";
import Repo from "./Repo";
import { version } from "os";

export default class Resource extends Repo {

    public constructor() {
        super('users');
    }

    public async add(data: any) {
        try {
            const result = await db.insert(resource).values({
                id: data.id,
                parentId: data.parentId,
                resourceType: data.type,
                userId: data.userId,
                properties: data.properties
            })
                .returning();
            return super.responseData(201, false, "Item was created successfully", result);
        } catch (error) {
            return super.handleError(error);
        }
    }

    public async getAll() {
        try {
            const result = await db.select().from(resource);
            return super.responseData(200, false, null, result);
        } catch (error) {
            return super.handleError(error);
        }
    }

    async processResourceOperations(operations: any) {
        const results: any[] = [];
        try {
            const transactionResult = await db.transaction(async (tx) => {
                for (const op of operations) {
                    let {
                        id,
                        command,
                        resourceType,
                        parentId,
                        userId,
                        properties,
                        pointer,
                        noteId,
                        repetitions,
                        interval,
                        type,
                        easiness,
                        version,
                        details
                    } = op;
                    let result: any = { id, command, status: "success", type: "resource" };
                    // console.log(op);

                    // console.log(command);

                    try {
                        // Determine target table
                        const tableName = pointer.table === "question" ? "questions" : pointer.table;
                        const targetTable = tableName === "questions" ? questions : resource;

                        // Check if resource/question exists
                        const existing = await tx
                            .select()
                            .from(targetTable)
                            .where(eq(targetTable.id, id));

                        // console.log(command);
                        // console.log(existing);
                        if (existing.length > 0) {
                            if (command === "create" && version != 0) {
                                throw new Error(`Version is invalid`);
                            }
                            if (command !== "create" && (existing[0].version! + 1) != version) {
                                throw new Error(`Version is invalid`);
                            }
                        }

                        // Validate foreign keys
                        if (tableName === "resource" && parentId) {
                            const parentExists = await tx
                                .select()
                                .from(resource)
                                .where(eq(resource.id, parentId));
                            if (parentExists.length === 0) {
                                throw new Error(`Parent resource with ID ${parentId} does not exist`);
                            }
                        }
                        switch (command.toLowerCase()) {
                            case "create":
                                if (existing.length > 0) {
                                    throw new Error(`Cannot create: ${tableName} with ID ${id} already exists`);
                                }
                                if (tableName === "resource") {
                                    const created = await tx
                                        .insert(resource)
                                        .values({
                                            id,
                                            resourceType,
                                            parentId,
                                            userId,
                                            properties,
                                            createdAt: new Date().toISOString(),
                                            updatedAt: new Date().toISOString(),
                                            version: version
                                        })
                                        .returning();
                                    result.data = created[0];
                                } else if (tableName === "questions") {

                                    const noteExists = await tx
                                        .select()
                                        .from(resource)
                                        .where(eq(resource.id, noteId));
                                    if (noteExists.length === 0) {
                                        const createdNote = await tx
                                            .insert(resource)
                                            .values({
                                                id: noteId,
                                                resourceType: "practice-note",
                                                properties: details,
                                                userId,
                                                createdAt: new Date().toISOString(),
                                                updatedAt: new Date().toISOString(),
                                                version: version
                                            })
                                            .returning();
                                        result.data = createdNote[0];
                                        results.push(result);
                                    }

                                    const created = await tx
                                        .insert(questions)
                                        .values({
                                            id,
                                            noteId: noteId,
                                            repetitions: repetitions,
                                            interval: interval,
                                            easiness: easiness,
                                            type: type,
                                            correctAnswer: "Hello", // ! update this
                                            details: details,
                                            version: version
                                        })
                                        .returning();
                                    result.type = "question";
                                    result.data = created[0];
                                }
                                break;

                            case "update":
                                if (existing.length === 0) {
                                    throw new Error(`Cannot update: ${tableName} with ID ${id} does not exist`);
                                }
                                if (tableName === "resource") {
                                    const updated = await tx
                                        .update(resource)
                                        .set({
                                            resourceType,
                                            parentId,
                                            userId,
                                            properties,
                                            updatedAt: new Date().toISOString(),
                                            version: version,
                                        })
                                        .where(eq(resource.id, id))
                                        .returning();
                                    result.data = updated[0];
                                } else if (tableName === "questions") {
                                    const updated = await tx
                                        .update(questions)
                                        .set({
                                            details: details,
                                            version: version
                                        })
                                        .where(eq(questions.id, id))
                                        .returning();
                                    result.type = "question";
                                    result.data = updated[0];
                                }
                                break;

                            case "set":
                                if (tableName === "resource") {
                                    if (existing.length > 0) {
                                        const updatedSet = await tx
                                            .update(resource)
                                            .set({
                                                resourceType,
                                                parentId,
                                                userId,
                                                properties,
                                                updatedAt: new Date().toISOString(),
                                                version: version
                                            })
                                            .where(eq(resource.id, id))
                                            .returning();
                                        result.data = updatedSet[0];
                                        console.log(`Set (updated) resource: ${id}`);
                                    } else {
                                        const createdSet = await tx
                                            .insert(resource)
                                            .values({
                                                id,
                                                resourceType,
                                                parentId,
                                                userId,
                                                properties,
                                                createdAt: new Date().toISOString(),
                                                updatedAt: new Date().toISOString(),
                                                version: version
                                            })
                                            .returning();
                                        result.data = createdSet[0];
                                        console.log(`Set (created) resource: ${id}`);
                                    }
                                } else if (tableName === "questions") {
                                    if (existing.length > 0) {
                                        const updatedSet = await tx
                                            .update(questions)
                                            .set({
                                                details: details,
                                                version: version
                                            })
                                            .where(eq(questions.id, id))
                                            .returning();
                                        result.data = updatedSet[0];
                                        console.log(`Set (updated) question: ${id}`);
                                    } else {
                                        const createdSet = await tx
                                            .insert(questions)
                                            .values({
                                                id,
                                                noteId: noteId,
                                                repetitions: repetitions,
                                                interval: interval,
                                                easiness: easiness,
                                                type: type,
                                                details: details,
                                                version: version,
                                                correctAnswer: "Hello" // ! Update
                                            })
                                            .returning();
                                        result.data = createdSet[0];
                                        console.log(`Set (created) question: ${id}`);
                                    }
                                }
                                break;

                            case "delete":
                                if (existing.length === 0) {
                                    throw new Error(`Cannot delete: ${tableName} with ID ${id} does not exist`);
                                }
                                await tx.delete(targetTable).where(eq(targetTable.id, id));
                                result.data = null;
                                break;

                            default:
                                throw new Error(`Unknown command: ${command} for ${tableName} ID ${id}`);
                        }
                    } catch (error) {
                        throw error; // Let transaction handle rollback
                    }

                    results.push(result);
                }

                return results;
            });

            return { type: 200, error: false, message: "Transactions were successful", data: transactionResult };
        } catch (error) {
            return this.handleError(error);
        }
    }

}