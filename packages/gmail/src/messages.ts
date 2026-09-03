import type {gmail_v1} from 'googleapis';

export async function listMessages(gmail: gmail_v1.Gmail , maxResults: number = 10): Promise<gmail_v1.Schema$Message[]> {
    const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults
    });
    return response.data.messages || [];
}

export async function getMessage(gmail: gmail_v1.Gmail , messageId: string): Promise<gmail_v1.Schema$Message> {
    const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
    });
    return response.data;
}

