import Redis from 'ioredis';
import { env } from '.';

const redisClient = new Redis(env('redisURL')!);
// const redisClient = new Redis("rediss://default:AVG-AAIjcDFiNjNiOTRkNjYwYTE0NjZkODNlMmNhODNhMGMyMTI3M3AxMA@quick-whale-20926.upstash.io:6379");

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
