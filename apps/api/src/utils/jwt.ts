import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(
    {
        path: '../../.env',
    }
);

const JWT_EXPIRATION = '7d'; // Token expiration time

export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set");
    }

    return secret;
}





export function createAccessToken(userId: string, email: string): string {
    const secret = getJwtSecret();
    return jwt.sign({ userId, email }, secret, { expiresIn: JWT_EXPIRATION });
}