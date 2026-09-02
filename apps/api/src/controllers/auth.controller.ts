import type { Request, Response } from "express";
import { google } from "googleapis";

import { googleOAuthClient } from "../config/google.js";
import { db, users, mailboxes, oAuthAccounts } from '@repo/db';
import { eq } from "drizzle-orm";
import { encrypt } from "../utils/encryption.js";
import { createAccessToken } from "../utils/jwt.js";

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
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


    const oauth2 = google.oauth2({
      version: "v2",
      auth: googleOAuthClient,
    });

    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.id || !googleUser.email || !googleUser.name) {
      return res.status(500).json({
        error: "Failed to retrieve user information from Google",
      });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);

    let user = existingUser[0];

    if (!user) {
      const [createdUser] = await db.insert(users).values({
        email: googleUser.email,
        name: googleUser.name,
      }).returning();
      user = createdUser;
    }

    const existingMailbox = await db.select().from(mailboxes).where(eq(mailboxes.userId, user.id)).limit(1);

    let mailbox = existingMailbox[0];

    if (!mailbox) {
      const [createdMailbox] = await db.insert(mailboxes).values({
        userId: user.id,
        provider: "gmail",
        providerAccountId: googleUser.id,
        email: googleUser.email,
        syncStatus: "pending",
      }).returning();
      mailbox = createdMailbox;
    }

    const existingOAuthAccount = await db.select().from(oAuthAccounts).where(eq(oAuthAccounts.mailboxId, mailbox.id)).limit(1);

    let oAuthAccount = existingOAuthAccount[0];

    if (!oAuthAccount) {
      const [createdOAuthAccount] = await db.insert(oAuthAccounts).values({
        mailboxId: mailbox.id,
        provider: "google",
        accessToken: encrypt(tokens.access_token || ""),
        refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token || "") : null,
        tokenType: tokens.token_type || "",
        scope: tokens.scope || "",
      }).returning();
      oAuthAccount = createdOAuthAccount;
    } else {
      const [updatedOAuthAccount] = await db.update(oAuthAccounts).set({
        accessToken: encrypt(tokens.access_token || ""),
        refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token || "") : null,
        tokenType: tokens.token_type || "",
        scope: tokens.scope || "",
      }).where(eq(oAuthAccounts.id, oAuthAccount.id));
    }


    const accessToken = createAccessToken(user.id, user.email);


    return res.status(200).json({
      message: "Google OAuth successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      mailbox: {
        id: mailbox.id,
        email: mailbox.email,
        provider: mailbox.provider,
      },
    });


  } catch (error) {
    console.error("Google OAuth callback failed:", error);

    return res.status(500).json({
      error: "Google OAuth failed",
    });
  }
};