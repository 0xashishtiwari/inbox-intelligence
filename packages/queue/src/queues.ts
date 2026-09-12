import { Queue } from 'bullmq';

import { redisConnection } from './connection.js';

export const gmailIngestionQueue = new Queue('gmail-ingestion', {

    connection: redisConnection

});