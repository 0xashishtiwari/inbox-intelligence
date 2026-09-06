export async function listMessages(gmail, maxResults = 100, PageToken) {
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
export async function getMessage(gmail, messageId) {
    const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
    });
    return response.data;
}
