import { describe, expect, it } from "vitest";
import { chunkText } from "./chunkText.js";

describe("chunkText", () => {
    it("splits a large email body into chunks", () => {
        const text = `
Hi Ashish,

Thank you for taking the time to speak with us about the Software Engineer position.

We enjoyed learning more about your background and technical experience.

We would like to invite you to the next stage of our interview process.

The technical interview will be conducted on Tuesday at 3 PM.

The interview will take approximately 60 minutes and will be conducted through Google Meet.

Please make sure that you have a stable internet connection and a working microphone.

Before the interview, please review the job description and be prepared to discuss your previous projects and technical decisions.

If you need to reschedule the interview, please let us know at least 24 hours in advance.

We look forward to speaking with you.

Regards,
Recruiting Team

${"This is additional information about the interview process. ".repeat(100)}
        `.trim();

        const result = chunkText(text);

        console.log("\n================ CHUNKS ================\n");

        result.forEach((chunk, index) => {
            console.log(`---------- CHUNK ${index} ----------`);
            console.log(chunk);
            console.log(`Characters: ${chunk.length}`);
            console.log();
        });

        console.log(`Total chunks: ${result.length}`);
        console.log("\n=========================================\n");

        expect(result.length).toBeGreaterThan(1);

        for (const chunk of result) {
            expect(chunk.length).toBeLessThanOrEqual(1200);
            expect(chunk.trim().length).toBeGreaterThan(0);
        }

        expect(result.join("\n")).toContain("Google Meet");
        expect(result.join("\n")).toContain("Software Engineer position");
    });

    it("does not return empty chunks", () => {
        const result = chunkText("Hello\n\n\nWorld");

        expect(result).not.toContain("");
    });
});