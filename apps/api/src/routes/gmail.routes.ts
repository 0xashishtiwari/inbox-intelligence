import {Router } from 'express';
import {eq , and }  from 'drizzle-orm';

import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { db } from '@repo/db'
import {mailboxes, oAuthAccounts} from '@repo/db';
import { createGmailClient, getProfile } from '@repo/gmail';
import {decrypt} from '../utils/encryption.js';

const router = Router();

router.get('/mailboxes/:id/gmail-test' , requireAuth , async (req: AuthenticatedRequest<{id: string}>, res) => {

    try{

        const mailboxId = req.params.id;
        const userId = req.user!.userId;

        //make sure the mailbox belongs to the user
        const mailbox = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.id , mailboxId),
                eq(mailboxes.userId , userId)
            )
        })  ;

        if(!mailbox){
            return res.status(404).json({error: 'Mailbox not found'});
        }

        //get the oAuth account for the mailbox
        const oAuthAccount = await db.query.oAuthAccounts.findFirst({
            where:  eq(oAuthAccounts.mailboxId , mailbox.id),
    
        })

        if(!oAuthAccount){
            return res.status(404).json({error: 'OAuth account not found for this mailbox'});
        }

        //decrypt the tokens
        const decryptedAccessToken = decrypt(oAuthAccount.accessToken);
        const decryptedRefreshToken = decrypt(oAuthAccount.refreshToken as string);

        //create a gmail client
        const gmailClient = createGmailClient(decryptedAccessToken , decryptedRefreshToken);


        //get the profile
        const profile = await getProfile(gmailClient);

        return res.status(200).json({
            success: true,
            mailboxId : mailbox.id,
            emailAddress: profile.emailAddress,
            messagesTotal: profile.messagesTotal,
            threadsTotal: profile.threadsTotal,
            historyId: profile.historyId
        })  

    }catch(err){
        console.error('Error in /mailboxes/:id/gmail-test:', err);
        return res.status(500).json({error: 'Internal server error'});
    }

})

export default router;