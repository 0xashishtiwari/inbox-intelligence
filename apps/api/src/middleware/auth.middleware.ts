import jwt from "jsonwebtoken";

import type { Request, Response, NextFunction } from "express";

import { getJwtSecret } from "../utils/jwt.js";

interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {

    try{
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const secret = getJwtSecret();

        const decoded = jwt.verify(token, secret) as JwtPayload;

        if(typeof decoded !== 'object' || !decoded.userId || !decoded.email) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.user = decoded;

        next();

    }catch(err) {
        console.error("Error in requireAuth middleware:", err);
        return res.status(401).json({ error: "Unauthorized" });
    }

}
