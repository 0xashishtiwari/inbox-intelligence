

import { db, messages, chunks } from "@repo/db";
import { eq, asc, sql } from "drizzle-orm";

import { indexMessage } from "./indexMessage.js";

async function main() {
    // Pick a random message from the database
    const [message] = await db
        .select({
            id: messages.id,
            subject: messages.subject,
        })
        .from(messages)
        .orderBy(sql`RANDOM()`)
        .limit(1);

    if (!message) {
        console.log("No messages found in database.");
        return;
    }

    console.log("\n========================================");
    console.log("Selected message");
    console.log("========================================");
    console.log("Message ID:", message.id);
    console.log("Subject:", message.subject);

    // Process + chunk + store in DB
    const result = await indexMessage(message.id);

    console.log("\n========================================");
    console.log("INDEXED CHUNKS");
    console.log("========================================");

    result.forEach((chunk) => {
        console.log(`\n---------- CHUNK ${chunk.chunkIndex} ----------`);
        console.log(chunk.content);
        console.log(`Characters: ${chunk.content.length}`);
    });

    console.log("\nTotal chunks:", result.length);

    // Verify what's actually in DB
    const dbChunks = await db
        .select()
        .from(chunks)
        .where(eq(chunks.messageId, message.id))
        .orderBy(asc(chunks.chunkIndex));

    console.log("\n========================================");
    console.log("DATABASE CHECK");
    console.log("========================================");

    console.log("Chunks stored in DB:", dbChunks.length);

    for (const chunk of dbChunks) {
        console.log(
            `Chunk ${chunk.chunkIndex}: ${chunk.content.length} characters`
        );
    }

    console.log("\n========================================\n");
}

main()
    .catch(console.error)
    .finally(() => process.exit());