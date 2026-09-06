import { Worker } from 'bullmq'

const worker = new Worker('gmail-ingestion', async (job) => {
    console.log('Processing job:', job.id, 'with data:', job.data);

    return {
        success: true,
        message: `Job ${job.id} processed successfully.`
    }

},
    {
        connection: {
            host: 'localhost',
            port: 6379
        }
    }

);


worker.on('completed' , (job)=>{
    console.log(`Job ${job.id} completed successfully.`);
})

worker.on('failed' , (job, err)=>{
    console.error(`Job ${job?.id} failed with error:`, err);
});

console.log('Gmail ingestion worker is running and listening for jobs...');