
import { defineConfig } from "drizzle-kit";

import dotenv from "dotenv";

dotenv.config({
  path: "../../.env",
});

export default defineConfig({
  schema: ["./src/schema/index.ts", "./src/schema/message.ts", "./src/schema/thread.ts", "./src/schema/mailboxes.ts", "./src/schema/users.ts", "./src/schema/oAuthAccount.ts", "./src/schema/relations.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});