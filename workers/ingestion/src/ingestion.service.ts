import {
    createGmailClient,
    fetchMessageIdBatches,
    getMessage,
    normalizeGmailMessage
} from '@repo/gmail';

import { eq, and, inArray } from 'drizzle-orm';

import { decrypt } from '@repo/crypto';

import { db, mailboxes, oAuthAccounts, threads, messages } from '@repo/db';

export async function ingestMailbox(mailBoxId: string, maxMessages: number) {

    console.log(`Starting ingestion for mailbox: ${mailBoxId} with maxMessages: ${maxMessages}`);

    // find the mailbox in the database

    const mailbox = await db.select().from(mailboxes).where(eq(mailboxes.id, mailBoxId));


    if (mailbox.length === 0) {
        throw new Error(`Mailbox with id ${mailBoxId} not found`);
    }


    console.log(`Found mailbox: ${mailbox[0].provider} with id: ${mailbox[0].id}`);

    // find the associated OAuth account
    const oAuthAccount = await db.select().from(oAuthAccounts).where(eq(oAuthAccounts.mailboxId, mailBoxId));

    if (oAuthAccount.length === 0) {
        throw new Error(`OAuth account for mailbox with id ${mailBoxId} not found`);
    }

    console.log(`Found OAuth account: ${oAuthAccount[0].provider} with id: ${oAuthAccount[0].id}`);

    // create a Gmail client using the OAuth account

    const accessToken = decrypt(oAuthAccount[0].accessToken);
    const refreshToken = oAuthAccount[0].refreshToken ? decrypt(oAuthAccount[0].refreshToken) : undefined;

    const gmailClient = createGmailClient(accessToken, refreshToken as string);

    for await (const messageIds of fetchMessageIdBatches(gmailClient, maxMessages)) {


        console.log(`Fetched ${messageIds.length} message IDs, processing...`);

        const existingMessages = await db.select({ providerMessageId: messages.providerMessageId }).from(messages).where(
            and(
                eq(messages.mailboxId, mailBoxId),
                inArray(messages.providerMessageId, messageIds)
            )
        );

        const existingMessageIds = new Set(existingMessages.map(msg => msg.providerMessageId));

        const newMessageIds = messageIds.filter(id => !existingMessageIds.has(id));

        console.log(`Found ${newMessageIds.length} new messages to process.`);


        const gmailMessages = [];

        for (let i = 0; i < newMessageIds.length; i += 2) {
            const currentIds = newMessageIds.slice(i, i + 2);

            const downloadingMessages = await Promise.all(currentIds.map((id) => getMessage(gmailClient, id)));

            gmailMessages.push(...downloadingMessages);
        }

        console.log(`Downloaded ${gmailMessages.length} new messages, normalizing and saving to database...`);

        // process each message and insert into the databases

        for (const gmailMessage of gmailMessages) {
            try {
                const normalizedMessage = normalizeGmailMessage(gmailMessage);

                console.log(`Processing message with id: ${normalizedMessage.providerMessageId} and subject: ${normalizedMessage.subject}`);

                // check if the thread already exists in the database
                let thread = await db.query.threads.findFirst({
                    where: and(
                        eq(threads.mailboxId, mailBoxId),
                        eq(threads.providerThreadId, normalizedMessage.providerThreadId)
                    )
                })


                if (!thread) {
                    const [createdThread] = await db.insert(threads).values({
                        mailboxId: mailBoxId,
                        providerThreadId: normalizedMessage.providerThreadId,
                        subject: normalizedMessage.subject
                    }).returning();

                    thread = createdThread;

                }


                // insert/update the message in the database

                await db
                    .insert(messages)
                    .values({
                        mailboxId: mailBoxId,

                        threadId: thread.id,

                        providerMessageId:
                            normalizedMessage.providerMessageId,

                        providerThreadId:
                            normalizedMessage.providerThreadId,

                        subject: normalizedMessage.subject,

                        sender: normalizedMessage.sender,

                        recipients:
                            normalizedMessage.recipients.join(", "),

                        timestamp: normalizedMessage.timestamp,

                        bodyText: normalizedMessage.bodyText,

                        bodyHtml: normalizedMessage.bodyHtml,

                        labels:
                            normalizedMessage.labels?.join(", "),

                        snippet: normalizedMessage.snippet,
                    })
                    .onConflictDoUpdate({
                        target: [
                            messages.mailboxId,
                            messages.providerMessageId,
                        ],

                        set: {
                            threadId: thread.id,

                            providerThreadId:
                                normalizedMessage.providerThreadId,

                            subject: normalizedMessage.subject,

                            sender: normalizedMessage.sender,

                            recipients:
                                normalizedMessage.recipients.join(", "),

                            timestamp: normalizedMessage.timestamp,

                            bodyText: normalizedMessage.bodyText,

                            bodyHtml: normalizedMessage.bodyHtml,

                            labels:
                                normalizedMessage.labels?.join(", "),

                            snippet: normalizedMessage.snippet,

                            updatedAt: new Date(),
                        },
                    });

                console.log(
                    `Saved message: ${normalizedMessage.providerMessageId}`
                );

            } catch (error) {
                console.error(
                    `Failed to process Gmail message`,
                    error
                );

                // Important:
                // One malformed message should not
                // stop the entire ingestion.
                continue;
            }
        }
    }
}