function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Keep some headroom below Gmail's 300 messages/minute
const MAX_REQUESTS_PER_MINUTE = 250;

const INTERVAL = 60_000 / MAX_REQUESTS_PER_MINUTE;

let nextAvailableTime = Date.now();

export async function waitForRateLimit(): Promise<void> {
    const now = Date.now();

    const scheduledTime = Math.max(
        now,
        nextAvailableTime
    );

    // Reserve this slot BEFORE waiting.
    nextAvailableTime = scheduledTime + INTERVAL;

    const waitTime = scheduledTime - now;

    if (waitTime > 0) {
        await sleep(waitTime);
    }
}