import { Worker } from 'bullmq'

const worker = new Worker('gmail-ingestion', async (job) => {
    console.log('Processing job:', job.id, 'with data:', job.data);


    const {mailBoxId } = job.data;

    if(!mailBoxId) {
        throw new Error('mailBoxId is required in job data');
    }

    // Here you would call the ingestMailbox function to process the mailbox
    // await ingestMailbox(mailBoxId, 100); // Assuming a default maxMessages of 100 for this example

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