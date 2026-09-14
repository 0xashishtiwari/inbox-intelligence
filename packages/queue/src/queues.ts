import { Queue } from 'bullmq';

import { redisConnection } from './connection.js';

export const gmailIngestionQueue = new Queue('gmail-ingestion', {

    connection: redisConnection

});

export const indexingQueue = new Queue(
    "indexing",
    {
        connection: redisConnection
    },

);

export const embeddingQueue = new Queue(
    "embedding",
    {
        connection: redisConnection
    }
);