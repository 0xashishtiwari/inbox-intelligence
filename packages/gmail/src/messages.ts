import type { gmail_v1 } from 'googleapis';
import { waitForRateLimit } from './utils/ratelimiter.js';

export interface ListMessagesResult {
    messages: gmail_v1.Schema$Message[];
    nextPageToken?: string;
}

export async function listMessages(gmail: gmail_v1.Gmail, maxResults: number = 100, pageToken?: string): Promise<ListMessagesResult> {
    const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        pageToken: pageToken
    });
    return {
        messages: response.data.messages || [],
        nextPageToken: response.data.nextPageToken ?? undefined
    };
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getMessage(gmail: gmail_v1.Gmail, messageId: string): Promise<gmail_v1.Schema$Message> {

    const maxRetries = 5;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        try {

            // Wait for rate limit before making the request
            await waitForRateLimit();

            const response = await gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            });

            return response.data;

        } catch (error: any) {

            const reason =
                error?.response?.data?.error?.errors?.[0]?.reason ??
                error?.cause?.errors?.[0]?.reason;

            const status =
                error?.response?.status ??
                error?.status ??
                error?.code;

            const isRateLimited =
                status === 429 ||
                (
                    status === 403 &&
                    (
                        reason === 'rateLimitExceeded' ||
                        reason === 'userRateLimitExceeded'
                    )
                );

                
            if (!isRateLimited) {
                throw error;
            }

            if (attempt === maxRetries) {
                throw error;
            }

            const baseDelay = Math.min(
                1000 * 2 ** (attempt - 1),
                30_000
            );

            // Prevent all concurrent requests from retrying
            // at exactly the same time.
            const jitter = Math.random() * 500;

            const delay = baseDelay + jitter;

            console.log(
                `Gmail rate limit hit for ${messageId}. ` +
                `Retrying in ${Math.round(delay)}ms... ` +
                `Attempt ${attempt}/${maxRetries}`
            );

            await sleep(delay);
        }
    }

    throw new Error('Unexpected retry state');
}

