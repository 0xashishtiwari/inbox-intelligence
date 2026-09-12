import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { and, eq } from "drizzle-orm";

import { db, mailboxes, searchLexical } from "@repo/db";

export async function searchMessages(
    req: AuthenticatedRequest<Record<string, string>>,
    res: Response
) {
    try {
        const userId = req.user!.userId;

        const {
            mailboxId,
            query,
            sender,
            startDate,
            endDate,
            threadId,
            limit,
            offset,
        } = req.body;

        if (!mailboxId || !query) {
            return res.status(400).json({
                error: "mailboxId and query are required",
            });
        }

        const parsedLimit = Number(limit ?? 20);
        const parsedOffset = Number(offset ?? 0);

        if (
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 100
        ) {
            return res.status(400).json({
                error: "limit must be an integer between 1 and 100",
            });
        }

        if (
            !Number.isInteger(parsedOffset) ||
            parsedOffset < 0
        ) {
            return res.status(400).json({
                error: "offset must be a non-negative integer",
            });
        }

        const mailbox = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.id, mailboxId),
                eq(mailboxes.userId, userId)
            ),
        });

        if (!mailbox) {
            return res.status(404).json({
                error: "Mailbox not found",
            });
        }

        const results = await searchLexical({
            mailboxId,
            query,
            sender,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            threadId,
            limit: parsedLimit,
            offset: parsedOffset,
        });

        return res.status(200).json({
            success: true,
            query,
            count: results.length,
            limit: parsedLimit,
            offset: parsedOffset,
            results,
        });

    } catch (error) {
        console.error("Search error:", error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
}