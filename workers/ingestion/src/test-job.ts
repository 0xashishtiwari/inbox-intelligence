import { Queue } from "bullmq";

const queue =  new Queue('gmail-ingestion', {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

const job = await queue.add('initial-job', {
    mailboxId: 'f79372f2-4c0f-49c2-b464-33f367dc46bb',
})

console.log('Job added to the queue with ID:', job.id);

await queue.close();