import 'dotenv/config';

import { createGmailClient, getProfile } from '@repo/gmail';
import { fetchAllMessages } from '@repo/gmail';
import { normalizeGmailMessage } from '../../../packages/gmail/src/normalize.js';
import { mailboxes, oAuthAccounts, db } from '@repo/db';
import { eq } from 'drizzle-orm';
import { decrypt } from './utils/encryption.js';
// TODO:
// Replace this with your actual Drizzle DB query.
// This function should retrieve the OAuth account belonging
// to the mailbox you want to test.
async function getMailboxOAuthAccount(mailboxId: string) {

    const mailbox = await db.select().from(mailboxes).where(eq(mailboxes.id, mailboxId)).limit(1);

    if (!mailbox || mailbox.length === 0) {
        throw new Error(
            `Mailbox with ID ${mailboxId} not found in the database.`
        );
    }

    const oauthAccount = await db.select().from(oAuthAccounts).where(eq(oAuthAccounts.mailboxId, mailboxId)).limit(1);

    if (!oauthAccount || oauthAccount.length === 0) {
        throw new Error(
            `OAuth account for mailbox with ID ${mailboxId} not found in the database.`
        );
    }



    return {
        accessToken: decrypt(oauthAccount[0].accessToken),
        refreshToken: decrypt(oauthAccount[0].refreshToken as string),
    };

}


async function main() {

    // --------------------------------------------------
    // 1. Select the mailbox we want to test
    // --------------------------------------------------

    const mailboxId = process.env.TEST_MAILBOX_ID;

    if (!mailboxId) {
        throw new Error(
            'TEST_MAILBOX_ID is missing from environment variables.'
        );
    }

    console.log('Testing mailbox:', mailboxId);


    // --------------------------------------------------
    // 2. Get OAuth account from database
    // --------------------------------------------------

    console.log('Loading OAuth account from database...');

    const oauthAccount = await getMailboxOAuthAccount(mailboxId);

    if (!oauthAccount.accessToken) {
        throw new Error('OAuth access token is missing.');
    }

    if (!oauthAccount.refreshToken) {
        throw new Error('OAuth refresh token is missing.');
    }

    console.log('OAuth account found');


    // --------------------------------------------------
    // 3. Create Gmail client
    // --------------------------------------------------

    console.log('Creating Gmail client...');

    const gmail = createGmailClient(
        oauthAccount.accessToken,
        oauthAccount.refreshToken
    );

    console.log('Gmail client created');


    // --------------------------------------------------
    // 4. Verify Gmail account
    // --------------------------------------------------

    console.log('Checking Gmail profile...');

    const profile = await getProfile(gmail);

    console.log(
        'Connected Gmail account:',
        profile.emailAddress
    );

    console.log(
        'Total Gmail messages:',
        profile.messagesTotal
    );

    console.log(
        'Total Gmail threads:',
        profile.threadsTotal
    );


    // --------------------------------------------------
    // 5. Fetch messages
    // --------------------------------------------------

    console.log('\nFetching Gmail messages...');

    // IMPORTANT:
    // Keep this small while testing.
    //
    // Later, remove the limit for the real ingestion worker.

    const messages = await fetchAllMessages(
        gmail,
        10
    );

    console.log(
        'Full Gmail messages fetched:',
        messages.length
    );


    // --------------------------------------------------
    // 6. Normalize messages
    // --------------------------------------------------

    console.log('\nNormalizing messages...');

    const normalizedEmails = [];

    for (const message of messages) {

        try {

            const normalized =
                normalizeGmailMessage(message);

            normalizedEmails.push(normalized);

        } catch (error) {

            console.error(
                'Failed to normalize message:',
                message.id,
                error
            );

            // Don't stop the complete ingestion
            // because one malformed message failed.
            continue;
        }
    }


    // --------------------------------------------------
    // 7. Display normalized emails
    // --------------------------------------------------

    console.log(
        '\nSuccessfully normalized:',
        normalizedEmails.length
    );

    for (const email of normalizedEmails) {

        console.log('\n========================================');

        console.log(
            'Provider Message ID:',
            email.providerMessageId
        );

        console.log(
            'Provider Thread ID:',
            email.providerThreadId
        );

        console.log(
            'Sender:',
            email.sender
        );

        console.log(
            'Recipients:',
            email.recipients
        );

        console.log(
            'Subject:',
            email.subject
        );

        console.log(
            'Timestamp:',
            email.timestamp
        );

        console.log(
            'Labels:',
            email.labels
        );

        console.log(
            'Snippet:',
            email.snippet
        );

        console.log('\nBody:');

        console.log(
            email.bodyText || '[No plain-text body]'
        );

        console.log('\nHTML body available:',
            Boolean(email.bodyHtml)
        );
    }


    // --------------------------------------------------
    // 8. Final result
    // --------------------------------------------------

    console.log('\n========================================');

    console.log('GMAIL INGESTION FLOW TEST COMPLETE');

    console.log('========================================');

    console.log(
        'Fetched:',
        messages.length
    );

    console.log(
        'Normalized:',
        normalizedEmails.length
    );

    console.log(
        'Failed:',
        messages.length - normalizedEmails.length
    );
}


main().catch(error => {

    console.error('\n========================================');

    console.error('GMAIL FLOW TEST FAILED');

    console.error('========================================');

    console.error(error);

    process.exit(1);
});