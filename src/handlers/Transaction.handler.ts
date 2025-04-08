import { Server } from "socket.io";
import { ISocket } from "../types/interface";
import { Events } from "../types/enums";
import Resource from "../repos/Resource";

export default class Transaction {

    public static async onConnection(io: Server, socket: ISocket) {
        console.log("User connected: ", socket.id);
        const userId = socket.locals.userId;
        const repo = new Resource();
        const resources = await repo.getAll();
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
            socket.emit(Events.APPERROR, {
                message: "All resource items are needed"
            });
            return;
        }

        const repo = new Resource();
        const result = await repo.add({ ...data, userId });
        if (result.error) {
            socket.emit(Events.APPERROR, {
                message: result.message
            });
            return;
        }

        socket.emit(Events.CREATEDRESOURCE, {
            message: "Resource was created successfully",
            data: result.data
        });
    }

    public static async massCrud(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.userId;

        if (!Array.isArray(data)) {
            socket.emit(Events.APPERROR, {
                message: "Data must be an array"
            });
            return;
        }

        const transactions = [];

        for (const transaction of data) {
            const { operations } = transaction;
            for (const operation of operations) {
                const { command, data } = operation;
                if (!command || !data) {
                    socket.emit(Events.APPERROR, {
                        message: "command and data are required"
                    });
                    return;
                }

                const { id, createdAt, updatedAt, properties, type } = data;
                if (!id || !createdAt || !updatedAt || !properties || !type) {
                    socket.emit(Events.APPERROR, {
                        message: "All values in the data object are required"
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
                    command: command
                });
            }
        }

        const repo = new Resource();
        const result = await repo.processResourceOperations(transactions);
        if (result.error) {
            // delete result['type'];
            socket.emit(Events.FAILEDTRANSACTION, {
                error: true,
                message: result.message,
                data: null
            });
            return;
        }

        socket.emit(Events.SUCCESSFULTRANSACTION, {
            data: result.data,
            error: false,
            message: "Transaction was successful"
        });
    }

}