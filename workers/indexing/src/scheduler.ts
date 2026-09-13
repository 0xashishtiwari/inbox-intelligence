import { indexingQueue } from "@repo/queue";

await indexingQueue.upsertJobScheduler(
    "indexing-scanner",
    {
        every: 5000,
    },
    {
        name: "scan-unindexed-messages",
        data: {},
        opts: {
            removeOnComplete: true,
            removeOnFail: 100,
        },
    }
);

console.log(
    "[INDEXING] Scheduler started - checking every 5 seconds"
);