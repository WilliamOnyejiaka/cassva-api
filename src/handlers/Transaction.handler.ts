import { Server } from "socket.io";
import { ISocket } from "../types/interface";
import { Events } from "../types/enums";
import Resource from "../repos/Resource";

export default class Transaction {

    public static async onConnection(io: Server, socket: ISocket) {
        console.log("User connected: ", socket.id);
        const userId = socket.locals.userId;
        const repo = new Resource();
        const resources = await repo.getAll();// TODO: only join rooms where this user id is present
        const rooms = (resources.data as any).map((item: any) => item.id);
        console.log(rooms);
        console.log("Joining rooms...");
        if (rooms) socket.join(rooms);
        console.log("✅ Rooms has been joint");

        socket.emit(Events.ONLINE, {
            error: false,
            message: "User is online"
        });
    }

    public static async createResource(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.userId;
        const { id, parentId, type, properties } = data
        if (!id || !type || !properties) {
            socket.emit(Events.APP_ERROR, {
                message: "All resource items are needed"
            });
            return;
        }

        const repo = new Resource();
        const result = await repo.add({ ...data, userId });
        if (result.error) {
            socket.emit(Events.APP_ERROR, {
                message: result.message
            });
            return;
        }

        socket.emit(Events.CREATED_RESOURCE, {
            message: "Resource was created successfully",
            data: result.data
        });
    }

    public static async massCrud(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.userId;

        if (!Array.isArray(data)) {
            socket.emit(Events.APP_ERROR, {
                message: "Data must be an array"
            });
            return;
        }

        const transactions = [];

        for (const transaction of data) {
            const { operations } = transaction;
            for (const operation of operations) {
                const { command, data, pointer } = operation;
                if (!command || !data || !pointer) {
                    socket.emit(Events.APP_ERROR, {
                        message: "command , pointer and data are required"
                    });
                    return;
                }

                let { id, table } = pointer;

                if (!id || !table) {
                    socket.emit(Events.APP_ERROR, {
                        message: "id and table required in pointer"
                    });
                    return;
                }

                id = (id as string).split('_')[1];
                const allowedTables = ['questions', 'resource', 'question'];
                if (!allowedTables.includes(table)) {
                    socket.emit(Events.APP_ERROR, {
                        message: "invalid table"
                    });
                    return;
                }

                const { version } = data;

                if (typeof version !== "number") {
                    socket.emit(Events.APP_ERROR, {
                        message: "invalid version type"
                    });
                    return;
                }

                // console.log(table);
                // console.log(operation);

                if (table == allowedTables[0] || table == allowedTables[2]) {
                    let { noteId, repetitions, interval, type, easiness, details } = data;

                    if (command === "create") {
                        if (!noteId || typeof repetitions === "undefined" || typeof interval === "undefined" || typeof easiness === "undefined" || !details) {
                            socket.emit(Events.APP_ERROR, {
                                message: "All values in the data object are required",
                                table: 'questions'
                            });
                            return;
                        }
                        noteId = (noteId as string).split("_")[1];
                    } else if (command === "set") {
                        if (!details) {
                            socket.emit(Events.APP_ERROR, {
                                message: "All values in the data object are required",
                                table: 'questions'
                            });
                            return;
                        }
                    }
                    transactions.push({ id, noteId, repetitions, interval, type, easiness, details: details, pointer, command, version, userId });
                } else {
                    const { createdAt, updatedAt, properties, type } = data;
                    if (!createdAt || !updatedAt || !properties || !type) {
                        socket.emit(Events.APP_ERROR, {
                            message: "All values in the data object are required",
                            table: 'resource'
                        });
                        return;
                    }
                    transactions.push({
                        id: id,
                        createdAt: createdAt,
                        updatedAt: updatedAt,
                        properties: properties,
                        resourceType: type,
                        userId: userId,
                        parentId: data?.parentId || null,
                        command: command,
                        pointer,
                        version
                    });
                }
            }
        }

        const repo = new Resource();
        const result = await repo.processResourceOperations(transactions);
        if (result.error) {
            // delete result['type'];
            socket.emit(Events.FAILED_TRANSACTION, {
                error: true,
                message: result.message,
                data: null
            });
            return;
        }

        const transactionIds = console.log(result.data);


        socket.emit(Events.SUCCESSFUL_TRANSACTION, {
            data: result.data,
            // data: transactions,
            error: false,
            message: "Transaction was successful"
        });
    }

}