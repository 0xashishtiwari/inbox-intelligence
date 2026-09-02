import {sql} from 'drizzle-orm'

import {db , client} from './client.js'

export async function testConnection() {
    try{
        const result = await db.execute(sql`SELECT 1`)
        console.log('Database connection successful:', result)
        
    }catch (error) {
        console.error('Database connection failed:', error)
    }finally{   
       client.end()
    }
}

testConnection()    