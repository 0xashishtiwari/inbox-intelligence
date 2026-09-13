import { db, messages, chunks } from "@repo/db";
import { eq } from "drizzle-orm";
import { processMessage, ProcessedChunk } from "../pipeline/processMessage.js";

export async function indexMessage(messageId: string): Promise<ProcessedChunk[]> {
    // 1. Fetch message
    const [message] = await db
        .select({
            id: messages.id,
            subject: messages.subject,
            bodyText: messages.bodyText,
            bodyHtml: messages.bodyHtml,
        })
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

    if (!message) {
        throw new Error(`Message with id ${messageId} not found`);
    }

    // 2. Clean + chunk
    const processedChunks = processMessage(message);

    // 3. Remove existing chunks
    await db
        .delete(chunks)
        .where(eq(chunks.messageId, messageId));

    // 4. Nothing to index
    if (processedChunks.length === 0) {
        return [];
    }

    // 5. Insert chunks
    await db
        .insert(chunks)
        .values(
            processedChunks.map((chunk) => ({
                messageId: chunk.messageId,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content,
            }))
        );

    // 6. Update message indexedAt
    await db
        .update(messages)
        .set({
            indexedAt: new Date(),
        })
        .where(eq(messages.id, messageId));

    // 7. Return processed chunks
    return processedChunks;
}