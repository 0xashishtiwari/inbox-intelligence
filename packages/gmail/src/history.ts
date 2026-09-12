import type { gmail_v1 } from 'googleapis';

export interface HistoryResult {
    history: gmail_v1.Schema$History[];
    nextPageToken?: string;
    historyId?: string;
}

export async function listHistory(gmail: gmail_v1.Gmail, startHistoryId: string, pageToken?: string): Promise<HistoryResult> {

    const response = await gmail.users.history.list({
        userId: 'me',
        startHistoryId,
        pageToken,
        historyTypes: ['messageAdded', 'messageDeleted', 'labelAdded', 'labelRemoved'],
    })

    return {
        history: response.data.history || [],
        nextPageToken: response.data.nextPageToken ?? undefined,
        historyId: response.data.historyId ?? undefined
    }
}