import { Worker } from "bullmq";
import { db, messages, chunks } from "@repo/db";
import { isNull , inArray } from "drizzle-orm";
import { indexMessages } from "@repo/retrieval";
import { indexingQueue , embeddingQueue } from "@repo/queue";


const BATCH_SIZE = 100;

export const indexingWorker = new Worker(
    "indexing",
    async (job) => {
        console.log(
            `[INDEXING] Job ${job.id} started`
        );

        // Find messages that have not been indexed yet
        const pendingMessages = await db
            .select({
                id: messages.id,
            })
            .from(messages)
            .where(isNull(messages.indexedAt))
            .limit(BATCH_SIZE);

        if (pendingMessages.length === 0) {
            console.log("[INDEXING] No messages to index");

            return {
                messagesIndexed: 0,
                chunksCreated: 0,
            };
        }

        const messageIds = pendingMessages.map(
            (message) => message.id
        );

        console.log(
            `[INDEXING] Found ${messageIds.length} messages`
        );

        // Batch indexing
        const result = await indexMessages(messageIds);

        console.log(
            `[INDEXING] Indexed ${result.messagesIndexed} messages`
        );

        console.log(
            `[INDEXING] Created ${result.chunksCreated} chunks`
        );

  // Find chunks created for these messages
        const createdChunks = await db
            .select({
                id: chunks.id,
            })
            .from(chunks)
            .where(inArray(chunks.messageId, messageIds));

        console.log(
            `[EMBEDDING] Found ${createdChunks.length} chunks`
        );

        // Add embedding jobs
        if (createdChunks.length > 0) {
            await embeddingQueue.addBulk(
                createdChunks.map((chunk) => ({
                    name: "generate-embedding",
                    data: {
                        chunkId: chunk.id,
                    },
                    opts: {
                        jobId: `embedding-${chunk.id}`,
                        attempts: 5,
                        backoff: {
                            type: "exponential" as const,
                            delay: 2000,
                        },
                        removeOnComplete: true,
                        removeOnFail: false,
                    },
                }))
            );

            console.log(
                `[EMBEDDING] Queued ${createdChunks.length} embedding jobs`
            );
        }

        return {
            ...result,
            embeddingJobsQueued: createdChunks.length,
        };
    },
    {
        // Reuse the same Redis connection configured in your queue
        // The queue and worker currently resolve different BullMQ copies.
        connection: indexingQueue.opts.connection as any,

        // Only one indexing job at a time
        concurrency: 1,
    }
);

indexingWorker.on("completed", (job, result) => {
    console.log(
        `[INDEXING] Job ${job.id} completed`,
        result
    );
});

indexingWorker.on("failed", (job, error) => {
    console.error(
        `[INDEXING] Job ${job?.id} failed:`,
        error
    );
});

indexingWorker.on("error", (error) => {
    console.error(
        "[INDEXING] Worker error:",
        error
    );
});

console.log("[INDEXING] Worker started");