import { pgTable, text, timestamp, uuid, integer, unique } from "drizzle-orm/pg-core";

import { messages } from "./message.js";

export const chunks = pgTable("chunks", {
    id: uuid("id").primaryKey().defaultRandom(),

    messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade", onUpdate: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),

    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    messageChunkUnique: unique().on(table.messageId, table.chunkIndex)
}))