import type {gmail_v1} from 'googleapis';

export async function listThreads(gmail: gmail_v1.Gmail , maxResults: number = 10): Promise<gmail_v1.Schema$Thread[]> {
    const response = await gmail.users.threads.list({
        userId: 'me',
        maxResults
    });
    return response.data.threads || [];
}

export async function getThread(gmail: gmail_v1.Gmail , threadId: string): Promise<gmail_v1.Schema$Thread> {
    const response = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full'
    });
    return response.data;
}