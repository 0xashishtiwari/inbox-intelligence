import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";

import { mailboxes } from "./mailboxes.js";
import { threads } from "./thread.js";

export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),

    mailboxId: uuid("mailbox_id").notNull().references(() => mailboxes.id, { onDelete: "cascade", onUpdate: "cascade" }),

    threadId: uuid("thread_id").notNull().references(() => threads.id, { onDelete: "cascade", onUpdate: "cascade" }),

    providerMessageId: text("provider_message_id").notNull(),


    providerThreadId: text("provider_thread_id").notNull(),

    subject: text("subject"),

    sender: text("sender").notNull(),

    recipients: text("recipients").notNull(),

    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),


    bodyText: text("body_text"),

    bodyHtml: text("body_html"),

    labels: text("labels"),

    snippet: text("snippet"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
},

    (table) => ({
        mailboxProviderMessageUnique: unique().on(table.mailboxId, table.providerMessageId)
    })

)