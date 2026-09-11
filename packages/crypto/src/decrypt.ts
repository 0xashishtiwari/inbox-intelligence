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

export function decrypt(encryptedText: string): string {
    const key = generateKey();

    const [ivBase64, authTagBase64, encryptedBase64] =
        encryptedText.split(":");

    if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
        throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");
    const encrypted = Buffer.from(encryptedBase64, "base64");

    if (
        iv.length !== IV_LENGTH ||
        authTag.length !== AUTH_TAG_LENGTH
    ) {
        throw new Error("Invalid IV or authentication tag length");
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        iv
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}