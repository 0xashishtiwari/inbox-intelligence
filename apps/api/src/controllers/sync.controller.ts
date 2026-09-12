import type { Response } from 'express';

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

import { gmailIngestionQueue } from '@repo/queue'
import { db, mailboxes } from '@repo/db'
import { and, eq } from 'drizzle-orm'


export async function syncMailbox(req: AuthenticatedRequest<{ id: string }>, res: Response) {

    try {

        const mailboxId = req.params.id;
        const userId = req.user?.userId;

        if (!mailboxId) {
            return res.status(400).json({ error: 'Missing mailboxId in request parameters' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if the mailbox exists and belongs to the authenticated user

        const mailbox =  await db.query.mailboxes.findFirst({
            where :  and (
                eq(mailboxes.id, mailboxId),
                eq(mailboxes.userId, userId)
            )
        })

        if (!mailbox) {
            return res.status(404).json({ error: 'Mailbox not found or does not belong to the user' });
        }


        const job = await gmailIngestionQueue.add("ingest-mailbox", {
            mailboxId,
            maxMessages: 100

        },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                },
                removeOnComplete: 100,
                removeOnFail: 100
            }

        );

        return res.status(200).json({
            message: 'Mailbox sync job added successfully',
            jobId: job.id,
            mailboxId: mailboxId

        })


    } catch (err) {
        console.error('Error adding mailbox sync job:', err);
        return res.status(500).json({ error: 'Failed to add mailbox sync job' });
    }

}