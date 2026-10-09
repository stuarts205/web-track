import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/configs/db";
import * as schema from "@/configs/schema";
import { trackLoginEvent } from "@/lib/track-login-event";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.usersTable,
    },
  }),
  databaseHooks: {
    session: {
      create: {
        // Replaces the old Clerk "session.created" webhook.
        after: async (session) => {
          try {
            await trackLoginEvent(session.userId, session.id);
          } catch (error) {
            console.error("Failed to track login event", error);
          }
        },
      },
    },
  },
});
