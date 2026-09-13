import {db , messages , chunks} from '@repo/db'
import { ProcessedChunk } from '../pipeline/processMessage.js'
import {eq} from 'drizzle-orm'
import { processMessage } from '../pipeline/processMessage.js'

export async function indexMessage(messageId : string ) {
    // fetch the message from the database
    const [message] = await db.select({
        id : messages.id,
        subject : messages.subject,
        bodyText : messages.bodyText,
        bodyHtml : messages.bodyHtml,

    }).from(messages).where(eq(messages.id, messageId)).limit(1);

    if(!message) {
        throw new Error(`Message with id ${messageId} not found`);
    }

    // convert + clean + chunk

    const processedChunks : ProcessedChunk[] =  processMessage(message);

    // remove any existing chunks for this message
    await db.delete(chunks).where(eq(chunks.messageId, messageId));


    // nothing to index
    if(processedChunks.length === 0) {
        return [];
    }

    // insert the new chunks into the database

    const insertedChunks = await db.insert(chunks).values(
        processedChunks.map(chunk => ({
            messageId : chunk.messageId,
            chunkIndex : chunk.chunkIndex,
            content : chunk.content
        }))
    ).returning();


    return insertedChunks;

}   