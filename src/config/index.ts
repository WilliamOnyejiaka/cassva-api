
import env from "./env";
import redisClient from "./redis";
import logger from "./logger";

export { env, logger,redisClient };

// export const tbls: Record<string, typeof users | typeof otpVerification | typeof resource | typeof questions | typeof resetTokens | typeof session> = {
//     users,
//     otpVerification,
//     resource,
//     questions,
//     resetTokens,
//     session,
// }; 
