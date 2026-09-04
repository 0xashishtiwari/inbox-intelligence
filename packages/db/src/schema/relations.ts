import { relations } from "drizzle-orm";

import { users } from "./users.js";
import { mailboxes } from "./mailboxes.js";
import { oAuthAccounts } from "./oAuthAccount.js";
import { threads } from "./thread.js";
import { messages } from "./message.js";

export const userRelation = relations(users, ({ many }) => ({
  mailboxes: many(mailboxes),
}));

export const mailboxRelation = relations(mailboxes, ({ one, many }) => ({
  user: one(users, {
    fields: [mailboxes.userId],
    references: [users.id],
  }),

  oAuthAccounts: many(oAuthAccounts),

  threads: many(threads),
}));

export const oAuthAccountRelation = relations(oAuthAccounts, ({ one }) => ({
  mailbox: one(mailboxes, {
    fields: [oAuthAccounts.mailboxId],
    references: [mailboxes.id],
  }),
}));

export const threadRelation = relations(threads, ({ one, many }) => ({
  mailbox: one(mailboxes, {
    fields: [threads.mailboxId],
    references: [mailboxes.id],
  }),

  messages: many(messages),
}));

export const messageRelation = relations(messages, ({ one }) => ({
  mailbox: one(mailboxes, {
    fields: [messages.mailboxId],
    references: [mailboxes.id],
  }),

  thread: one(threads, {
    fields: [messages.threadId],
    references: [threads.id],
  }),
}));