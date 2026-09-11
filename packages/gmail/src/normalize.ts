import type { gmail_v1 } from 'googleapis';

// Normalized Email type

export interface NormalizedEmail {
    providerMessageId: string;
    providerThreadId: string;

    sender: string;
    recipients: string[];

    subject: string;
    timestamp: Date;

    bodyText?: string;
    bodyHtml?: string;

    labels?: string[];
    snippet?: string;
}


// Helper function to get a specific header value from the headers array

function getHeader(headers: gmail_v1.Schema$MessagePartHeader[] = [], name: string): string {

    return headers.find(header => header.name?.toLowerCase() === name.toLowerCase())?.value || '';

}

// GMail Base64 URL Decoder 

function decodeBase64Url(data?: string): string {
    if (!data) return '';

    const normalized = data
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    return Buffer.from(normalized, 'base64').toString('utf-8');
}


// Mime parser function to extract text and HTML content from the message payload

function extractBodies(part?: gmail_v1.Schema$MessagePart): { text: string; html: string } {

    if (!part) return { text: '', html: '' };

    // plain text part
    if (part.mimeType === 'text/plain' && part.body?.data) {
        return { text: decodeBase64Url(part.body.data), html: '' };
    }

    // HTML part
    if (part.mimeType === 'text/html' && part.body?.data) {
        return { text: '', html: decodeBase64Url(part.body.data) };
    }

    let text = '';
    let html = '';


    for (const child of part.parts || []) {
        const result = extractBodies(child);

        if (!text && result.text) text += result.text;
        if (!html && result.html) html += result.html;

    }

    return { text, html };
}

//clean the message Text 

function cleanText(text: string): string {
  return text
    // Remove invisible Unicode characters
    .replace(/[\u200A\u200B-\u200D\uFEFF\u2060\u2007\u00AD]/g, "")

    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")

    // Remove trailing whitespace
    .replace(/[ \t]+$/gm, "")

    // Collapse excessive blank lines
    .replace(/\n{3,}/g, "\n\n")

    .trim();
}

// Main function to normalize a Gmail message into the NormalizedEmail format

export function normalizeGmailMessage(message: gmail_v1.Schema$Message): NormalizedEmail {
    const payload = message.payload;
    const headers = payload?.headers || [];

    const sender = getHeader(headers, 'From');

    const recipients = getHeader(headers, 'To').split(',').map(email => email.trim()).filter(email => email);

    const subject = getHeader(headers, 'Subject');

    const timestamp = new Date(getHeader(headers, 'Date'));

    const { text, html } = extractBodies(payload);

    const bodyText = cleanText(text);
    const bodyHtml = cleanText(html);

    return {
        providerMessageId: message.id!,
        providerThreadId: message.threadId!,

        sender,
        recipients,

        subject,
        timestamp,

        bodyText: bodyText || undefined,
        bodyHtml: bodyHtml || undefined,

        labels: message.labelIds || undefined,
        snippet: message.snippet || undefined
    };
}