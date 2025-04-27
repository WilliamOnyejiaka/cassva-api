import Redis from 'ioredis';
import { env } from '.';

const redisClient = new Redis(env('redisURL')!);

redisClient.on("connecting", () => {
    console.log("Redis Connecting...");
})

redisClient.on("connect", () => {
    console.log('redis running on port - ', redisClient.options.port);
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redisClient;
