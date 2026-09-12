import {
    createGmailClient,
    fetchMessageIdBatches,
    getMessage,
    normalizeGmailMessage,
    getProfile,
    listHistory
} from '@repo/gmail';

import { eq, and, inArray } from 'drizzle-orm';

import { decrypt } from '@repo/crypto';

import {
    db,
    mailboxes,
    oAuthAccounts,
    threads,
    messages
} from '@repo/db';

export async function ingestMailbox(
    mailBoxId: string,
    maxMessages?: number
) {
    console.log(
        `Starting ingestion for mailbox: ${mailBoxId} with maxMessages: ${maxMessages}`
    );

    // Find mailbox
    const mailbox = await db
        .select()
        .from(mailboxes)
        .where(eq(mailboxes.id, mailBoxId));

    if (mailbox.length === 0) {
        throw new Error(`Mailbox with id ${mailBoxId} not found`);
    }

    const currentMailbox = mailbox[0];

    console.log(
        `Found mailbox: ${currentMailbox.provider} with id: ${currentMailbox.id}`
    );

    // Find associated OAuth account
    const oAuthAccount = await db
        .select()
        .from(oAuthAccounts)
        .where(eq(oAuthAccounts.mailboxId, mailBoxId));

    if (oAuthAccount.length === 0) {
        throw new Error(
            `OAuth account for mailbox with id ${mailBoxId} not found`
        );
    }

    console.log(
        `Found OAuth account: ${oAuthAccount[0].provider} with id: ${oAuthAccount[0].id}`
    );

    // Create Gmail client
    const accessToken = decrypt(oAuthAccount[0].accessToken);

    const refreshToken = oAuthAccount[0].refreshToken
        ? decrypt(oAuthAccount[0].refreshToken)
        : undefined;

    const gmailClient = createGmailClient(
        accessToken,
        refreshToken as string
    );

    // Get current Gmail profile
    const profile = await getProfile(gmailClient);

    const currentHistoryId = profile.historyId;

    console.log(`Current Gmail historyId: ${currentHistoryId}`);

    const storedHistoryId = currentMailbox.historyId;

    console.log(
        `Stored historyId in database: ${storedHistoryId}`
    );

    /*
     * ============================================================
     * INITIAL SYNC
     * ============================================================
     */

    if (!storedHistoryId) {
        console.log(
            'No stored history ID. Performing initial sync.'
        );

        for await (const messageIds of fetchMessageIdBatches(
            gmailClient,
            maxMessages
        )) {
            console.log(
                `Fetched ${messageIds.length} message IDs, processing...`
            );

            const existingMessages = await db
                .select({
                    providerMessageId: messages.providerMessageId
                })
                .from(messages)
                .where(
                    and(
                        eq(messages.mailboxId, mailBoxId),
                        inArray(
                            messages.providerMessageId,
                            messageIds
                        )
                    )
                );

            const existingMessageIds = new Set(
                existingMessages.map(
                    (msg) => msg.providerMessageId
                )
            );

            const newMessageIds = messageIds.filter(
                (id) => !existingMessageIds.has(id)
            );

            console.log(
                `Found ${newMessageIds.length} new messages to process.`
            );

            const gmailMessages = [];

            // Download messages with concurrency = 2
            for (let i = 0; i < newMessageIds.length; i += 2) {
                const currentIds = newMessageIds.slice(i, i + 2);

                const downloadingMessages = await Promise.all(
                    currentIds.map((id) =>
                        getMessage(gmailClient, id)
                    )
                );

                gmailMessages.push(...downloadingMessages);
            }

            console.log(
                `Downloaded ${gmailMessages.length} new messages, normalizing and saving to database...`
            );

            // Save messages
            for (const gmailMessage of gmailMessages) {
                try {
                    const normalizedMessage =
                        normalizeGmailMessage(gmailMessage);

                    console.log(
                        `Processing message with id: ${normalizedMessage.providerMessageId} and subject: ${normalizedMessage.subject}`
                    );

                    // Find existing thread
                    let thread =
                        await db.query.threads.findFirst({
                            where: and(
                                eq(
                                    threads.mailboxId,
                                    mailBoxId
                                ),
                                eq(
                                    threads.providerThreadId,
                                    normalizedMessage.providerThreadId
                                )
                            )
                        });

                    // Create thread if it doesn't exist
                    if (!thread) {
                        const [createdThread] =
                            await db
                                .insert(threads)
                                .values({
                                    mailboxId: mailBoxId,

                                    providerThreadId:
                                        normalizedMessage.providerThreadId,

                                    subject:
                                        normalizedMessage.subject
                                })
                                .returning();

                        thread = createdThread;
                    }

                    // Insert/update message
                    await db
                        .insert(messages)
                        .values({
                            mailboxId: mailBoxId,

                            threadId: thread.id,

                            providerMessageId:
                                normalizedMessage.providerMessageId,

                            providerThreadId:
                                normalizedMessage.providerThreadId,

                            subject:
                                normalizedMessage.subject,

                            sender:
                                normalizedMessage.sender,

                            recipients:
                                normalizedMessage.recipients.join(
                                    ', '
                                ),

                            timestamp:
                                normalizedMessage.timestamp,

                            bodyText:
                                normalizedMessage.bodyText,

                            bodyHtml:
                                normalizedMessage.bodyHtml,

                            labels:
                                normalizedMessage.labels?.join(
                                    ', '
                                ),

                            snippet:
                                normalizedMessage.snippet
                        })
                        .onConflictDoUpdate({
                            target: [
                                messages.mailboxId,
                                messages.providerMessageId
                            ],

                            set: {
                                threadId: thread.id,

                                providerThreadId:
                                    normalizedMessage.providerThreadId,

                                subject:
                                    normalizedMessage.subject,

                                sender:
                                    normalizedMessage.sender,

                                recipients:
                                    normalizedMessage.recipients.join(
                                        ', '
                                    ),

                                timestamp:
                                    normalizedMessage.timestamp,

                                bodyText:
                                    normalizedMessage.bodyText,

                                bodyHtml:
                                    normalizedMessage.bodyHtml,

                                labels:
                                    normalizedMessage.labels?.join(
                                        ', '
                                    ),

                                snippet:
                                    normalizedMessage.snippet,

                                updatedAt: new Date()
                            }
                        });

                    console.log(
                        `Saved message: ${normalizedMessage.providerMessageId}`
                    );
                } catch (error) {
                    console.error(
                        'Failed to process Gmail message',
                        error
                    );

                    continue;
                }
            }
        }

        /*
         * Save Gmail history ID after initial sync.
         */
        if (currentHistoryId) {
            await db
                .update(mailboxes)
                .set({
                    historyId: currentHistoryId,
                    syncStatus: 'completed',
                    updatedAt: new Date()
                })
                .where(eq(mailboxes.id, mailBoxId));

            console.log(
                `Initial sync completed. Saved historyId: ${currentHistoryId}`
            );
        }

        return;
    }

    /*
     * ============================================================
     * INCREMENTAL SYNC
     * ============================================================
     */

    console.log(
        `Performing incremental sync from historyId: ${storedHistoryId}`
    );

    const changedMessageIds = new Set<string>();
    const deletedMessageIds = new Set<string>();

    let nextPageToken: string | undefined = undefined;
    let latestHistoryId: string | undefined;

    do {
        const historyResult = await listHistory(
            gmailClient,
            storedHistoryId,
            nextPageToken
        );

        console.log(
            `Fetched ${historyResult.history.length} history records`
        );

        /*
         * New messages
         */
        for (const history of historyResult.history) {
            for (const added of history.messagesAdded ?? []) {
                const messageId = added.message?.id;

                if (messageId) {
                    changedMessageIds.add(messageId);
                }
            }

            /*
             * Label changes mean the message changed.
             * We fetch the latest version from Gmail.
             */
            for (const added of history.labelsAdded ?? []) {
                const messageId = added.message?.id;

                if (messageId) {
                    changedMessageIds.add(messageId);
                }
            }

            for (const removed of history.labelsRemoved ?? []) {
                const messageId = removed.message?.id;

                if (messageId) {
                    changedMessageIds.add(messageId);
                }
            }

            /*
             * Deleted messages
             */
            for (const deleted of history.messagesDeleted ?? []) {
                const messageId = deleted.message?.id;

                if (messageId) {
                    deletedMessageIds.add(messageId);
                }
            }
        }

        /*
         * Gmail returns the latest history ID.
         */
        if (historyResult.historyId) {
            latestHistoryId = historyResult.historyId;
        }

        nextPageToken = historyResult.nextPageToken;

    } while (nextPageToken);

    console.log(
        `Found ${changedMessageIds.size} changed messages`
    );

    console.log(
        `Found ${deletedMessageIds.size} deleted messages`
    );

    /*
     * ============================================================
     * DELETE REMOVED MESSAGES
     * ============================================================
     */

    if (deletedMessageIds.size > 0) {
        await db
            .delete(messages)
            .where(
                and(
                    eq(messages.mailboxId, mailBoxId),
                    inArray(
                        messages.providerMessageId,
                        [...deletedMessageIds]
                    )
                )
            );

        console.log(
            `Deleted ${deletedMessageIds.size} messages from database`
        );
    }

    /*
     * ============================================================
     * FETCH CHANGED MESSAGES
     * ============================================================
     */

    const messageIdsToFetch = [
        ...changedMessageIds
    ].filter(
        (id) => !deletedMessageIds.has(id)
    );

    for (let i = 0; i < messageIdsToFetch.length; i += 2) {
        const currentIds = messageIdsToFetch.slice(i, i + 2);

        const gmailMessages = await Promise.all(
            currentIds.map((id) =>
                getMessage(gmailClient, id)
            )
        );

        for (const gmailMessage of gmailMessages) {
            try {
                const normalizedMessage =
                    normalizeGmailMessage(gmailMessage);

                console.log(
                    `Processing changed message: ${normalizedMessage.providerMessageId}`
                );

                /*
                 * Find/create thread
                 */
                let thread =
                    await db.query.threads.findFirst({
                        where: and(
                            eq(
                                threads.mailboxId,
                                mailBoxId
                            ),
                            eq(
                                threads.providerThreadId,
                                normalizedMessage.providerThreadId
                            )
                        )
                    });

                if (!thread) {
                    const [createdThread] =
                        await db
                            .insert(threads)
                            .values({
                                mailboxId: mailBoxId,

                                providerThreadId:
                                    normalizedMessage.providerThreadId,

                                subject:
                                    normalizedMessage.subject
                            })
                            .returning();

                    thread = createdThread;
                }

                /*
                 * Upsert changed message
                 */
                await db
                    .insert(messages)
                    .values({
                        mailboxId: mailBoxId,

                        threadId: thread.id,

                        providerMessageId:
                            normalizedMessage.providerMessageId,

                        providerThreadId:
                            normalizedMessage.providerThreadId,

                        subject:
                            normalizedMessage.subject,

                        sender:
                            normalizedMessage.sender,

                        recipients:
                            normalizedMessage.recipients.join(
                                ', '
                            ),

                        timestamp:
                            normalizedMessage.timestamp,

                        bodyText:
                            normalizedMessage.bodyText,

                        bodyHtml:
                            normalizedMessage.bodyHtml,

                        labels:
                            normalizedMessage.labels?.join(
                                ', '
                            ),

                        snippet:
                            normalizedMessage.snippet
                    })
                    .onConflictDoUpdate({
                        target: [
                            messages.mailboxId,
                            messages.providerMessageId
                        ],

                        set: {
                            threadId: thread.id,

                            providerThreadId:
                                normalizedMessage.providerThreadId,

                            subject:
                                normalizedMessage.subject,

                            sender:
                                normalizedMessage.sender,

                            recipients:
                                normalizedMessage.recipients.join(
                                    ', '
                                ),

                            timestamp:
                                normalizedMessage.timestamp,

                            bodyText:
                                normalizedMessage.bodyText,

                            bodyHtml:
                                normalizedMessage.bodyHtml,

                            labels:
                                normalizedMessage.labels?.join(
                                    ', '
                                ),

                            snippet:
                                normalizedMessage.snippet,

                            updatedAt: new Date()
                        }
                    });

                console.log(
                    `Updated message: ${normalizedMessage.providerMessageId}`
                );

            } catch (error) {
                console.error(
                    'Failed to process changed Gmail message',
                    error
                );

                continue;
            }
        }
    }

    /*
     * ============================================================
     * SAVE NEW HISTORY ID
     * ============================================================
     */

    const newHistoryId =
        latestHistoryId ?? currentHistoryId;

    if (newHistoryId) {
        await db
            .update(mailboxes)
            .set({
                historyId: newHistoryId,
                syncStatus: 'completed',
                updatedAt: new Date()
            })
            .where(eq(mailboxes.id, mailBoxId));

        console.log(
            `Incremental sync completed. Saved historyId: ${newHistoryId}`
        );
    }

    console.log(
        `Mailbox ${mailBoxId} synchronization completed successfully.`
    );
}