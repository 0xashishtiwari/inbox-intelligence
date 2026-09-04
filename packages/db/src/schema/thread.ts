import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";

import { mailboxes } from "./mailboxes.js";

export const threads = pgTable("threads", {
    id: uuid("id").primaryKey().defaultRandom(),

    mailboxId: uuid("mailbox_id").notNull().references(() => mailboxes.id, { onDelete: "cascade", onUpdate: "cascade" }),

    providerThreadId: text("provider_thread_id").notNull(),

    subject: text("subject"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

},
    (table) => ({
        mailboxProviderThreadUnique: unique().on(table.mailboxId, table.providerThreadId)
    })
)