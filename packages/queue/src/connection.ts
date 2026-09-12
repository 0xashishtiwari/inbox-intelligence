import type {ConnectionOptions} from 'bullmq';

export const redisConnection : ConnectionOptions = {
    host : process.env.REDIS_HOST || 'localhost',
    port : process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
}