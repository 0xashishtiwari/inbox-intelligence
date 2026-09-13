import { db, messages, chunks } from "@repo/db";
import { inArray } from "drizzle-orm";
import { processMessage } from "../pipeline/processMessage.js";

export async function indexMessages(messageIds: string[]) {
    if (messageIds.length === 0) {
        return {
            messagesIndexed: 0,
            chunksCreated: 0,
        };
    }

    // Fetch all messages from DB
    const rows = await db
        .select({
            id: messages.id,
            subject: messages.subject,
            bodyText: messages.bodyText,
            bodyHtml: messages.bodyHtml,
        })
        .from(messages)
        .where(inArray(messages.id, messageIds));

    const allChunks = [];

    for (const message of rows) {
        const processedChunks = processMessage(message);

        for (const chunk of processedChunks) {
            allChunks.push({
                messageId: chunk.messageId,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content,
            });
        }
    }

    // Remove existing chunks for these messages
    await db
        .delete(chunks)
        .where(inArray(chunks.messageId, messageIds));

    // Nothing to insert
    if (allChunks.length === 0) {
        return {
            messagesIndexed: rows.length,
            chunksCreated: 0,
        };
    }

    // Insert all chunks in one DB operation
    await db
        .insert(chunks)
        .values(allChunks);


    await db
        .update(messages)
        .set({
            indexedAt: new Date(),
        })
        .where(inArray(messages.id, messageIds));

    return {
        messagesIndexed: rows.length,
        chunksCreated: allChunks.length,
    };
}