import { eq } from "drizzle-orm";
import db from "../config/drizzle";
import { resource, users } from "../drizzle/schema";
import Repo from "./Repo";

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

    // Transaction to process resource operations
    // async processResourceOperations(operations: any) {
    //     try {
    //         await db.transaction(async (tx) => {
    //             for (const op of operations) {
    //                 const { id, command, resourceType, parentId, userId, properties } = op;

    //                 // Check if resource exists
    //                 const existing = await tx
    //                     .select()
    //                     .from(resource)
    //                     .where(eq(resource.id, id));

    //                 // Validate parentId if provided
    //                 if (parentId) {
    //                     const parentExists = await tx
    //                         .select()
    //                         .from(resource)
    //                         .where(eq(resource.id, parentId));
    //                     if (parentExists.length === 0) {
    //                         throw new Error(`Parent resource with ID ${parentId} does not exist`);
    //                     }
    //                 }

    //                 switch (command.toLowerCase()) {
    //                     case 'create':
    //                         if (existing.length > 0) {
    //                             throw new Error(`Cannot create: Resource with ID ${id} already exists`);
    //                         }
    //                         await tx.insert(resource).values({
    //                             id,
    //                             resourceType,
    //                             parentId,
    //                             userId,
    //                             properties,
    //                             createdAt: new Date().toISOString(),
    //                             updatedAt: new Date().toISOString(),
    //                         });
    //                         console.log(`Created resource: ${id}`);
    //                         break;

    //                     case 'update':
    //                         if (existing.length === 0) {
    //                             throw new Error(`Cannot update: Resource with ID ${id} does not exist`);
    //                         }
    //                         await tx
    //                             .update(resource)
    //                             .set({
    //                                 resourceType,
    //                                 parentId,
    //                                 userId,
    //                                 properties,
    //                                 updatedAt: new Date().toISOString(),
    //                             })
    //                             .where(eq(resource.id, id));
    //                         console.log(`Updated resource: ${id}`);
    //                         break;

    //                     case 'set':
    //                         // Upsert behavior
    //                         if (existing.length > 0) {
    //                             await tx
    //                                 .update(resource)
    //                                 .set({
    //                                     resourceType,
    //                                     parentId,
    //                                     userId,
    //                                     properties,
    //                                     updatedAt: new Date().toISOString(),
    //                                 })
    //                                 .where(eq(resource.id, id));
    //                             console.log(`Set (updated) resource: ${id}`);
    //                         } else {
    //                             await tx.insert(resource).values({
    //                                 id,
    //                                 resourceType,
    //                                 parentId,
    //                                 userId,
    //                                 properties,
    //                                 createdAt: new Date().toISOString(),
    //                                 updatedAt: new Date().toISOString(),
    //                             });
    //                             console.log(`Set (created) resource: ${id}`);
    //                         }
    //                         break;

    //                     case 'delete':
    //                         if (existing.length === 0) {
    //                             throw new Error(`Cannot delete: Resource with ID ${id} does not exist`);
    //                         }
    //                         await tx.delete(resource).where(eq(resource.id, id));
    //                         console.log(`Deleted resource: ${id}`);
    //                         break;

    //                     default:
    //                         throw new Error(`Unknown command: ${command} for resource ID ${id}`);
    //                 }
    //             }
    //         });
    //         console.log('All resource operations completed successfully');
    //     } catch (error) {
    //         return this.handleError(error)
    //     }
    // }

    async processResourceOperations(operations: any) {
        const results: any[] = [];
        try {
            const transactionResult = await db.transaction(async (tx) => {
                for (const op of operations) {
                    const { id, command, resourceType, parentId, userId, properties } = op;
                    let result: any = { id, command, status: 'success' };

                    try {
                        // Check if resource exists
                        const existing = await tx
                            .select()
                            .from(resource)
                            .where(eq(resource.id, id));

                        // Validate parentId if provided
                        if (parentId) {
                            const parentExists = await tx
                                .select()
                                .from(resource)
                                .where(eq(resource.id, parentId));
                            if (parentExists.length === 0) {
                                throw new Error(`Parent resource with ID ${parentId} does not exist`);
                            }
                        }

                        switch (command.toLowerCase()) {
                            case 'create':
                                if (existing.length > 0) {
                                    throw new Error(`Cannot create: Resource with ID ${id} already exists`);
                                }
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
                                    })
                                    .returning(); // Return inserted row
                                result.data = created[0];
                                break;

                            case 'update':
                                if (existing.length === 0) {
                                    throw new Error(`Cannot update: Resource with ID ${id} does not exist`);
                                }
                                const updated = await tx
                                    .update(resource)
                                    .set({
                                        resourceType,
                                        parentId,
                                        userId,
                                        properties,
                                        updatedAt: new Date().toISOString(),
                                    })
                                    .where(eq(resource.id, id))
                                    .returning(); // Return updated row
                                result.data = updated[0];
                                break;

                            case 'set':
                                if (existing.length > 0) {
                                    const updatedSet = await tx
                                        .update(resource)
                                        .set({
                                            resourceType,
                                            parentId,
                                            userId,
                                            properties,
                                            updatedAt: new Date().toISOString(),
                                        })
                                        .where(eq(resource.id, id))
                                        .returning();
                                    result.data = updatedSet[0];
                                    result.status = 'success';
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
                                        })
                                        .returning();
                                    result.data = createdSet[0];
                                    result.status = 'success';
                                    console.log(`Set (created) resource: ${id}`);
                                }
                                break;

                            case 'delete':
                                if (existing.length === 0) {
                                    throw new Error(`Cannot delete: Resource with ID ${id} does not exist`);
                                }
                                await tx.delete(resource).where(eq(resource.id, id));
                                result.data = null; // No data to return for delete
                                break;

                            default:
                                throw new Error(`Unknown command: ${command} for resource ID ${id}`);
                        }
                    } catch (error) {
                        // tx.rollback();
                        // return this.handleError(error);
                        // console.error(`Operation failed for ${id}:`, error);
                        throw error; // Replace tx.rollback() and return
                    }

                    results.push(result);
                }

                return results; // Return the array of results from the transaction
            });

            return { type: 200, error: false, message: "Transactions were successful", data: transactionResult }; // Return the results to the caller
        } catch (error) {
            // tx.rollback();
            return this.handleError(error);
        }
    }

}