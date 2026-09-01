import type { Request, Response } from "express";
import { google } from "googleapis";

import { googleOAuthClient } from "../config/google.js";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
];

export const googleAuth = (_req: Request, res: Response) => {
  const authorizationUrl = googleOAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_SCOPES,
    prompt: "consent",
  });

  res.redirect(authorizationUrl);
};

export const googleCallback = async (
  req: Request,
  res: Response,
) => {
  try {
    const { code } = req.query;

    if (typeof code !== "string") {
      return res.status(400).json({
        error: "Missing authorization code",
      });
    }

    const { tokens } = await googleOAuthClient.getToken(code);

    googleOAuthClient.setCredentials(tokens);

    const gmail = google.gmail({
      version: "v1",
      auth: googleOAuthClient,
    });

    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    return res.json({
      message: "Google OAuth successful",
      email: profile.data.emailAddress,
    });
  } catch (error) {
    console.error("Google OAuth callback failed:", error);

    return res.status(500).json({
      error: "Google OAuth failed",
    });
  }
};