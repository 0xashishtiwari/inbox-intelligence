import { Router } from 'express';
import { googleOAuthClient } from '../config/google.js';
import type { Router as ExpressRouter } from 'express';
import type { Request, Response } from 'express';
import {googleCallback , googleAuth} from '../controllers/auth.controller.js';


const authRouter: ExpressRouter = Router();





authRouter.get('/google', googleAuth);

authRouter.get('/google/callback', googleCallback);

export default authRouter;