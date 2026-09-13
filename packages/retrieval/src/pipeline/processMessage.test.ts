import { describe, expect, it } from "vitest";
import { processMessage } from "./processMessage.js";

describe("processMessage", () => {
    it("converts HTML email and creates chunks", () => {
        const message = {
            id: "message-1",
            subject: "Microsoft is hiring",
            bodyText: null,
            bodyHtml: `
                <html>
                    <head>
                        <style>
                            body { color: red; }
                        </style>
                    </head>

                    <body>
                        <h1>Microsoft is hiring!</h1>
                        <p>
                            We are looking for software engineers.
                        </p>
                        <p>
                            Apply here:
                            https://example.com/very-long-link
                        </p>
                    </body>
                </html>
            `,
        };

        const result = processMessage(message);

        expect(result.length).toBeGreaterThan(0);

        expect(result[0].messageId).toBe("message-1");
        expect(result[0].chunkIndex).toBe(0);

        const combined = result
            .map((chunk) => chunk.content)
            .join("\n");

        expect(combined).toContain("Microsoft is hiring!");
        expect(combined).toContain("software engineers");

        expect(combined).not.toContain("color: red");
    });

    it("returns no chunks when email has no body", () => {
        const message = {
            id: "message-2",
            subject: "Empty email",
            bodyText: null,
            bodyHtml: null,
        };

        const result = processMessage(message);

        expect(result).toEqual([]);
    });
});