import { redisClient } from "../config";

export default class BaseCache {

    protected readonly preKey: string;
    protected readonly expirationTime: number;


    public constructor(preKey: string, expirationTime: number = 2_592_000) {
        this.preKey = preKey;
        this.expirationTime = expirationTime;
    }

    protected cacheResponse(error: boolean, message: string | null = null, data: any = {}) {
        return {
            error: error,
            message: message,
            data: data
        }
    }

    public async set(key: string, data: any, expirationTime?: number) {
        try {
            const success = await redisClient.set(
                `${this.preKey}-${key}`,
                JSON.stringify(data),
                'EX',
                expirationTime ?? this.expirationTime
            );
            return success === "OK";
        } catch (error) {
            console.error(`Failed cache: ${error}`);
            return false;
        }
    }

    public async get(key: string) {
        try {
            const item = await redisClient.get(`${this.preKey}-${key}`);
            return {
                error: false,
                data: item
            }
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return {
                error: true,
                data: null
            };
        }
    }

    public async delete(key: string) {
        try {
            const result = await redisClient.del(`${this.preKey}-${key}`);
            return result === 1;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return true;
        }
    }
}