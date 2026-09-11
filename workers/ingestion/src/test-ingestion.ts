import { ingestMailbox } from "./ingestion.service.js";

const mailboxId = "f79372f2-4c0f-49c2-b464-33f367dc46bb";

try {
    const result = await ingestMailbox(mailboxId,5000);

    console.log("Ingestion completed:", result);
    process.exit(0);
} catch (error) {
    console.error("Ingestion failed:");
    console.error(error);
    
    if (error instanceof Error) {
        console.error("Message:", error.message);
        console.error("Cause:", error.cause);
        console.error("Stack:", error.stack);
    }

    process.exit(1);
}