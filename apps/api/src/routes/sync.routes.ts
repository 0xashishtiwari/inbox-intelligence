import {Router} from 'express';

import { syncMailbox } from '../controllers/sync.controller.js';
import {requireAuth} from '../middleware/auth.middleware.js';

const router = Router();

router.post('/mailboxes/:id/sync', requireAuth, syncMailbox);

export default router;
