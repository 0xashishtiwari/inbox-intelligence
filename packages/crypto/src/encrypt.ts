import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function generateKey(): Buffer {
    const key = process.env.AES_GCM_256_ENCRYPTION_KEY;

    if (!key) {
        throw new Error(
            "AES_GCM_256_ENCRYPTION_KEY environment variable is not set"
        );
    }

    const keyBuffer = Buffer.from(key, "base64");

    if (keyBuffer.length !== 32) {
        throw new Error(
            "AES_GCM_256_ENCRYPTION_KEY must be a base64-encoded 32-byte key"
        );
    }

    return keyBuffer;
}

export function encrypt(plainText: string): string {
    const key = generateKey();

    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        key,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(plainText, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted.toString("base64"),
    ].join(":");
}