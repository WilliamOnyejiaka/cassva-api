import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { env, logger } from ".";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';
import { ISocket } from "../types/interface";
// import { Namespace } from "../types/enums";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { setupWorker } from "@socket.io/sticky";
import cluster from "cluster";
import compression from 'compression';
import * as fs from 'fs/promises';
import * as path from 'path';
import { transaction } from "../events";
import { Namespace } from "../types/enums";
import { secureSocket, validateUserId } from "../middlewares";

async function createApp() {
    const app: Application = express();
    const server = http.createServer(app);
    // const io = new Server(server, { cors: { origin: "*" }});

    const pubClient = createClient({ url: env('redisURL')! });
    const subClient = pubClient.duplicate();
    const io = new Server(server, { cors: { origin: "*" } });

    try {
        await Promise.all([pubClient.connect(), subClient.connect()]);
        console.log("Redis clients connected");

        // // Test Redis pub/sub
        // await pubClient.publish("test-channel", "test-message");
        // subClient.subscribe("test-channel", (message) => {
        //     console.log(`Worker ${process.pid} received: ${message}`);
        // });

        io.adapter(createAdapter(pubClient, subClient));
        console.log(`Worker ${process.pid} initialized Redis adapter`);

        if (cluster.isWorker) setupWorker(io);
    } catch (err) {
        console.error(`Worker ${process.pid} - Redis Connection Error:`, err);
        process.exit(1);
    }

    const stream = { write: (message: string) => logger.http(message.trim()) };

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(compression());
    app.use(morgan("combined", { stream }));
    
    // io.use(secureSocket);

    const transactionNamespace = io.of(Namespace.TRANSACTION);
    transactionNamespace.use(secureSocket);
    transactionNamespace.use(validateUserId)
    transaction.initialize(transactionNamespace, io);

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.io = io;
        next();
    });

    // app.use(secureApi);

    app.use((req: Request, res: Response, next: NextFunction) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        })
    });

    io.on('connect_error', (err) => {
        console.log('Connection error:', err.message);
    });

    return server;
}


export default createApp;