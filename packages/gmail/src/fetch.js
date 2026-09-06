import { listMessages, getMessage } from './messages.js';
export async function fetchAllMessages(gmail, maxMessages) {
    const messages = [];
    let nextPageToken = undefined;
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
    } while (nextPageToken);
    return messages;
}
