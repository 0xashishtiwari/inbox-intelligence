import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";


import { mailboxes } from "./mailboxes";


export const oAuthAccounts = pgTable("oauth_accounts", {
    id: uuid("id").primaryKey().defaultRandom(),

    mailboxId: uuid("mailbox_id").notNull().references(() => mailboxes.id, { onDelete: "cascade" }),

    provider: text("provider").notNull(),

    accessToken: text("access_token").notNull(),

    refreshToken: text("refresh_token"),

    tokenType: text("token_type"),

    scope: text("scope"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})