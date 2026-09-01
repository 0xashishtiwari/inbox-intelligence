import {google} from 'googleapis'
import dotenv from 'dotenv';

dotenv.config({
  path: '../../.env'
});

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

if(!clientId || !clientSecret || !redirectUri) {
  throw new Error('Missing Google OAuth configuration in environment variables');
}

export const googleOAuthClient = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

