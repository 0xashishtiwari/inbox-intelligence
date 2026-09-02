import { relations } from 'drizzle-orm'


import { mailboxes } from './mailboxes.js'
import { oAuthAccounts } from './oAuthAccount.js'
import { users } from './users.js'



export const userRelation = relations(users, ({ many }) => ({
    mailboxes: many(mailboxes),
}));


export const mailboxRelation = relations(mailboxes, ({ one }) => ({
    user: one(users, {
        fields: [mailboxes.userId],
        references: [users.id],
    }),
    oAuthAccounts: one(oAuthAccounts, {
        fields: [mailboxes.id],
        references: [oAuthAccounts.mailboxId],
    }),

}))

export const oAuthAccountRelation = relations(oAuthAccounts, ({ one }) => ({
    mailbox: one(mailboxes, {
        fields: [oAuthAccounts.mailboxId],
        references: [mailboxes.id],
    }),
}))