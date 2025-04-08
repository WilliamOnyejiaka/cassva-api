import { env } from '../config';
import { ISocket } from '../types/interface';

const secureSocket = async (socket: ISocket, next: (err?: any) => void) => {
    const apiKey = socket.handshake.auth.key || socket.handshake.headers['key'];    

    if (!apiKey) return next({
        statusCode: 401,
        message: "API key is missing",
        type: "MISSING_KEY"
    });

    if (apiKey !== env('apiKey')!) return next({
        statusCode: 403,
        message: "Invalid API key",
        type: "INVALID_KEY"
    });

    next();
}

export default secureSocket;