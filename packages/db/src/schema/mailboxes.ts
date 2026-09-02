import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";


export const mailboxes = pgTable("mailboxes", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    provider: text("provider").default("gmail"),

    providerAccountId: text("provider_account_id").notNull(),

    email: text("email").notNull(),

    syncStatus: text("sync_status").notNull().default("pending"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
