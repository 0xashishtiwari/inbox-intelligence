export {db} from './client.js'

export * from './schema/index.js'

import {db} from './client.js'

import {sql} from 'drizzle-orm'

export {searchLexical} from './lexical.js'   

export function checkDatabaseConnection() {
    return db.execute(sql`SELECT 1`)
}