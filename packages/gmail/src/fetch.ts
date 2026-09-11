import type { gmail_v1 } from "googleapis";
import { listMessages, getMessage } from "./messages.js";


function sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const batchSize = 100;
const CONCURRENCY = 2;



export async function* fetchMessageIdBatches(gmail: gmail_v1.Gmail, maxMessages?: number): AsyncGenerator<string[]> {
    let nextPageToken: string | undefined = undefined;

    let totalFetched = 0;

    do {
        const remainingMessages = maxMessages !== undefined ? maxMessages - totalFetched : batchSize;

        if (remainingMessages <= 0) {
            break;
        }

        const pageSize = Math.min(batchSize, remainingMessages);

        const result = await listMessages(gmail, pageSize, nextPageToken);

        const messageIds = result.messages.map((message) => message.id).filter((id): id is string => id !== undefined);


        totalFetched += messageIds.length;

        yield messageIds;

        nextPageToken = result.nextPageToken;

    } while (nextPageToken)
}



// export async function* fetchMessageBatches(
//     gmail: gmail_v1.Gmail,
//     maxMessages?: number
// ): AsyncGenerator<gmail_v1.Schema$Message[]> {

//     let nextPageToken: string | undefined = undefined;

//     let totalFetched = 0;

//     do {
//         const remainingMessages = maxMessages !== undefined ? maxMessages - totalFetched : batchSize;



//         if (remainingMessages <= 0) {
//             break;
//         }

//         const pageSize = Math.min(batchSize, remainingMessages);


//         const result = await listMessages(gmail, pageSize, nextPageToken);

//         const messageIds = result.messages.map((message) => message.id).filter((id): id is string => id !== undefined);

//         const batch: gmail_v1.Schema$Message[] = [];


//         //fetch messages in batches of CONCURRENCY
//         for (let i = 0; i < messageIds.length; i += CONCURRENCY) {

//             const currentIds = messageIds.slice(i, i + CONCURRENCY);

//             const messages = await Promise.all(currentIds.map((id) => getMessage(gmail, id)));

//             batch.push(...messages);
//         }

//         totalFetched += batch.length;

//         console.log(`Fetched ${batch.length} messages, total fetched: ${totalFetched}`);



//         //send the batch to ingestion service

//         yield batch;


//         nextPageToken = result.nextPageToken;
//     } while (nextPageToken)



// }