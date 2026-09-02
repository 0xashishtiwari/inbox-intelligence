import {Router } from 'express';

import { requireAuth , type AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }


    res.json({ userId: req.user.userId, email: req.user.email });
});

export default router;