import { db, messages } from "@repo/db";
import { emailToText } from "./emailToText.js";
import { chunkText } from "../chunking/chunkText.js";

async function main() {
    const messageRows = await db
        .select({
            id: messages.id,
            subject: messages.subject,
            bodyText: messages.bodyText,
            bodyHtml: messages.bodyHtml,
        })
        .from(messages)
        .limit(10);

    for (const message of messageRows) {
        console.log("\n========================================");
        console.log("Message ID:", message.id);
        console.log("Subject:", message.subject);
        console.log("BodyText length:", message.bodyText?.length ?? 0);
        console.log("BodyHTML length:", message.bodyHtml?.length ?? 0);

        const cleanText = emailToText(
            message.bodyText,
            message.bodyHtml,
        );

        if (!cleanText) {
            console.log("No usable email content");
            continue;
        }

        console.log("\n========== CLEAN TEXT ==========\n");
        console.log(cleanText);
        console.log("\n================================\n");

        console.log("Clean text length:", cleanText.length);

        const chunks = chunkText(cleanText);

        console.log("Total chunks:", chunks.length);

        chunks.forEach((chunk, index) => {
            console.log(`\n---------- CHUNK ${index} ----------`);
            console.log(chunk);
            console.log(`Characters: ${chunk.length}`);
        });
    }
}

main()
    .catch(console.error)
    .finally(() => process.exit());