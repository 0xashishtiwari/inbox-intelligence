import {Worker } from 'bullmq';
import {ingestMailbox} from './ingestion.service.js';
import {redisConnection} from '@repo/queue';

const worker =  new Worker('gmail-ingestion' , async(job)=>{

    console.log(`[worker] Processing job ${job.id} of type ${job.name}`);
    
    const {mailboxId , maxMessages} = job.data;

    if(!mailboxId){
        throw new Error('Missing mailboxId in job data');
    }


    await job.updateProgress(10);
    await ingestMailbox(mailboxId, maxMessages);

    await job.updateProgress(100);

    return { success: true, mailboxId , maxMessages };  

}, {
    connection : redisConnection,

    // Optional: Set concurrency to control how many jobs can be processed in parallel
    concurrency: 1
})


worker.on('completed', (job , result) => {
    console.log(`[worker] Job ${job.id} completed successfully.`, result);
})

worker.on('failed', (job , err) => {
    console.error(`[worker] Job ${job?.id} failed with error:`, err);
}) 

worker.on('error', (err) => {
    console.error(`[worker] Worker encountered an error:`, err);
})

console.log('[worker] Gmail ingestion is running and waiting for jobs...');
