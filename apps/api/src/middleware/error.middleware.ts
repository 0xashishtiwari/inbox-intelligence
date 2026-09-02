import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error({
        err : err,
       method: req.method,
       url: req.originalUrl,
      
    } , "Unhandled request error occurred");

    if(res.headersSent){
        return;
    }

    res.status(500).json({ error: "Internal Server Error" });
}