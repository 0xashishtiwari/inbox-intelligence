import type { gmail_v1 } from 'googleapis';

import { listMessages, getMessage } from './messages.js';

export async function fetchAllMessages(gmail: gmail_v1.Gmail, maxMessages: number): Promise<gmail_v1.Schema$Message[]> {


    const messages: gmail_v1.Schema$Message[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
        const remainingMessages = maxMessages - messages.length;

        if (remainingMessages <= 0) {
            break;
        }

        const result = await listMessages(gmail, Math.min(100, remainingMessages), nextPageToken);

        for (const message of result.messages) {
            if (!message.id) {
                continue;
            }
            const fullMessage = await getMessage(gmail, message.id);

            messages.push(fullMessage);

            if (maxMessages && messages.length >= maxMessages) {
                break;
            }


        }
        nextPageToken = result.nextPageToken;
    }
    while (nextPageToken);

    return messages;
}