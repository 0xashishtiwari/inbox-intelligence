import { db, messages } from "@repo/db";
import { chunkText } from "./chunkText.js";
import { writeFile } from "node:fs/promises";

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

        // Prefer bodyText when available
        if (message.bodyText?.trim()) {
            const chunks = chunkText(message.bodyText);

            console.log("Source: bodyText");
            console.log("Total chunks:", chunks.length);

            chunks.forEach((chunk, index) => {
                console.log(`\n---------- CHUNK ${index} ----------`);
                console.log(chunk);
                console.log(`Characters: ${chunk.length}`);
            });

            continue;
        }

        // If bodyText is missing, save the complete HTML
        if (message.bodyHtml?.trim()) {
            const filename = `email-${message.id}.html`;

            await writeFile(
                filename,
                message.bodyHtml,
                "utf-8"
            );

            console.log("Source: bodyHtml");
            console.log("Complete HTML saved to:", filename);

            continue;
        }

        console.log("No bodyText or bodyHtml");
    }
}

main()
    .catch(console.error)
    .finally(() => process.exit());