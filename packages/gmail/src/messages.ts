import type {gmail_v1} from 'googleapis';

export interface ListMessagesResult {
    messages: gmail_v1.Schema$Message[];
    nextPageToken?: string;
}

export async function listMessages(gmail: gmail_v1.Gmail , maxResults: number = 100 , PageToken?: string): Promise<ListMessagesResult> {
    const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        pageToken: PageToken
    });
    return {
        messages: response.data.messages || [],
        nextPageToken: response.data.nextPageToken ?? undefined
    };
}

export async function getMessage(gmail: gmail_v1.Gmail , messageId: string): Promise<gmail_v1.Schema$Message> {
    const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
    });
    return response.data;
}

