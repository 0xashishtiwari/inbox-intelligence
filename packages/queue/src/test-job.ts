import { gmailIngestionQueue } from "./queues.js";

const job = await gmailIngestionQueue.add("ingest-mailbox", {
    mailboxId: "f79372f2-4c0f-49c2-b464-33f367dc46bb",
    maxMessages: 10,
});

console.log("Job added:", job.id);

const counts = await gmailIngestionQueue.getJobCounts(
    "waiting",
    "active",
    "completed",
    "failed"
);

console.log("Queue counts:", counts);

process.exit(0);