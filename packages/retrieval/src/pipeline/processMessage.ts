import {emailToText} from '../cleaning/emailToText.js';
import {chunkText} from '../chunking/chunkText.js';

export interface MessageInput {
        id: string;
        subject: string | null;
        bodyText: string | null;
        bodyHtml: string | null;
}
export interface ProcessedChunk {
    messageId: string;
    chunkIndex: number;
    content: string;
}

export function processMessage(message : MessageInput) : ProcessedChunk[] {
    const text = emailToText(message.bodyText, message.bodyHtml);

    if (!text) {
        return [];
    }

    const chunks = chunkText(text);

    return chunks.map((chunk, index) => ({
        messageId: message.id,
        chunkIndex: index,
        content: chunk,
    }));
}