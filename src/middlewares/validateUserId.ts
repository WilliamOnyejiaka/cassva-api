import { ISocket } from '../types/interface';

const validateUserId = async (socket: ISocket, next: (err?: any) => void) => {
    const userId = socket.handshake.auth.userid || socket.handshake.headers['userid'];    
    
    if (!userId) return next({
        statusCode: 401,
        message: "User Id is missing",
        type: "MISSING_KEY"
    });
    socket.locals = {};
    socket.locals['userId'] = userId;
    next();
}

export default validateUserId;