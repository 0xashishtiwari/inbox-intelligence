import { Worker } from 'bullmq';

import { eq } from 'drizzle-orm';

import { db, chunks } from '@repo/db';

import { embeddingQueue } from '@repo/queue';
import { GeminiEmbeddingProvider } from '@repo/embeddings';

const provider = new GeminiEmbeddingProvider(
    process.env.GEMINI_API_KEY!
);

export const embeddingWorker = new Worker(
    "embedding",
    async (job) => {
        const { chunkId } = job.data;

        console.log(
            `[EMBEDDING] Job ${job.id} started for chunk ${chunkId}`
        );

        const result = await db.select({
            id: chunks.id,
            content: chunks.content,
            embedding: chunks.embedding
        }).from(chunks).where(
            eq(chunks.id, chunkId)
        ).limit(1);


        const chunk = result[0];

        if (!chunk) {
            throw new Error(`Chunk with id ${chunkId} not found`);
        }

        // Don't generate the embedding twice
        if (chunk.embedding) {
            console.log(
                `[EMBEDDING] Chunk ${chunkId} already embedded`
            );

            return {
                chunkId,
                skipped: true,
            };
        }

        const embedding = await provider.embed(chunk.content);

        await db.update(chunks).set({
            embedding
        }).where(
            eq(chunks.id, chunkId)
        );

        console.log(
            `[EMBEDDING] Job ${job.id} completed for chunk ${chunkId}`
        );


        return {
            chunkId,
            dimension: embedding.length,
        }

    },

    {
        connection: embeddingQueue.opts.connection as any,
        concurrency: 1,
        limiter: {
            max: 1,
            duration: 1000,
        },
    }


)

embeddingWorker.on("completed", (job, result) => {
    console.log(
        `[EMBEDDING] Job ${job.id} completed`,
        result
    );
});

embeddingWorker.on("failed", (job, error) => {
    console.error(
        `[EMBEDDING] Job ${job?.id} failed:`,
        error
    );
});

embeddingWorker.on("error", (error) => {
    console.error(
        "[EMBEDDING] Worker error:",
        error
    );
});

console.log("[EMBEDDING] Worker started");