import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config({
    path: "../../.env",
});
export function createGmailClient(accessToken, refreshToken) {
    const auth = new google.auth.OAuth2({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });
    return google.gmail({ version: 'v1', auth });
}
export async function getProfile(gmail) {
    const response = await gmail.users.getProfile({
        userId: 'me'
    });
    return response.data;
}
