import { load } from "cheerio";

export function emailToText(
    bodyText?: string | null,
    bodyHtml?: string | null
): string {
    let text = bodyText ?? "";

    // Prefer plain text body
    // If unavailable, convert HTML to plain text
    if (!text && bodyHtml) {
        text = htmlToText(bodyHtml);
    }

    // Clean the extracted email text
    text = cleanText(text);

    // Replace long URLs after basic text cleanup
    text = cleanUrls(text);

    // Final whitespace cleanup
    text = normalizeWhitespace(text);

    return text.trim();
}

function htmlToText(html: string): string {
    const $ = load(html);

    // Remove elements that should never become email text
    $("script, style, noscript, template").remove();

    return $.root().text();
}

function cleanText(text: string): string {
    return text
        // Remove invisible Unicode characters
        .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")

        // Normalize non-breaking spaces
        .replace(/\u00A0/g, " ")

        // Normalize line endings
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")

        // Collapse horizontal whitespace
        .replace(/[ \t]+/g, " ")

        // Collapse excessive blank lines
        .replace(/\n\s*\n\s*\n+/g, "\n\n")

        .trim();
}

function cleanUrls(text: string): string {
    return text.replace(
        /https?:\/\/[^\s<>"']+/gi,
        (url) => {
            // Keep short URLs
            if (url.length <= 100) {
                return url;
            }

            // Remove large tracking/marketing URLs
            return "[LINK]";
        }
    );
}

function normalizeWhitespace(text: string): string {
    return text
        // Remove trailing spaces from each line
        .replace(/[ \t]+\n/g, "\n")

        // Collapse excessive blank lines
        .replace(/\n{3,}/g, "\n\n")

        .trim();
}