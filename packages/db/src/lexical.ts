import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "./client.js";

import { messages } from "./schema/message.js";

type LexicalSearchOptions = {
    mailboxId: string;
    threadId?: string;
    query?: string;
    sender?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

export async function searchLexical({ mailboxId, threadId, query, sender, startDate, endDate, limit = 20, offset = 0 }: LexicalSearchOptions) {

    const searchVector = sql`
    setweight(
        to_tsvector(
            'english',
            coalesce(${messages.subject}, '')
        ),
        'A'
    )
    ||
    setweight(
        to_tsvector(
            'english',
            coalesce(${messages.bodyText}, '')
        ),
        'B'
    )
    ||
    setweight(
        to_tsvector(
            'english',
            coalesce(${messages.sender}, '')
        ),
        'C'
    )
`;

    const searchQuery = query ? sql`plainto_tsquery('english', ${query})` : null;
    const score = sql<number>`ts_rank(${searchVector}, ${searchQuery ?? sql`''::tsquery`})`;


    const conditions = [
        eq(messages.mailboxId, mailboxId),
    ];

    if (searchQuery) {
        conditions.push(sql`${searchVector} @@ ${searchQuery}`);
    }

    if (sender) {
        conditions.push(sql`${messages.sender} ILIKE ${'%' + sender + '%'}`);
    }

    if (threadId) {
        conditions.push(eq(messages.threadId, threadId));
    }

    if (startDate) {
        conditions.push(gte(messages.timestamp, startDate));
    }

    if (endDate) {
        conditions.push(lte(messages.timestamp, endDate));
    }

    const results = await db
        .select({
            id: messages.id,
            threadId: messages.threadId,
            sender: messages.sender,
            subject: messages.subject,
            timestamp: messages.timestamp,
            snippet: messages.snippet,
            score,
        })
        .from(messages)
        .where(and(...conditions))
        .orderBy(desc(score))
        .offset(offset)
        .limit(limit);

    return results;
}