import { describe, expect, it } from "vitest";
import { emailToText } from "./emailToText.js";

describe("emailToText", () => {
    it("prefers bodyText when available", () => {
        const result = emailToText(
            "This is the plain text",
            "<p>This is HTML</p>"
        );

        expect(result).toBe("This is the plain text");
    });

    it("converts HTML to plain text", () => {
        const result = emailToText(
            null,
            `
            <html>
                <head>
                    <style>
                        body { color: red; }
                    </style>
                </head>
                <body>
                    <h1>Microsoft is hiring!</h1>
                    <p>We are looking for software engineers.</p>
                    <script>
                        console.log("remove me");
                    </script>
                </body>
            </html>
            `
        );

        expect(result).toContain("Microsoft is hiring!");
        expect(result).toContain("We are looking for software engineers.");

        expect(result).not.toContain("color: red");
        expect(result).not.toContain("remove me");
    });

    it("returns empty string when no body exists", () => {
        expect(emailToText(null, null)).toBe("");
    });

    it("removes invisible unicode characters", () => {
        const result = emailToText(
            "Hello\u200B World\uFEFF"
        );

        expect(result).toBe("Hello World");
    });

    it("normalizes excessive whitespace", () => {
        const result = emailToText(
            "Hello     World\n\n\n\nThis is a test"
        );

        expect(result).toBe(
            "Hello World\n\nThis is a test"
        );
    });

    it("replaces very long URLs with [LINK]", () => {
        const longUrl =
            "https://example.com/" + "a".repeat(200);

        const result = emailToText(
            `Visit this link: ${longUrl}`
        );

        expect(result).toContain("[LINK]");
        expect(result).not.toContain(longUrl);
    });

    it("preserves short URLs", () => {
        const shortUrl = "https://example.com/jobs";

        const result = emailToText(
            `Apply here: ${shortUrl}`
        );

        expect(result).toContain(shortUrl);
    });
});