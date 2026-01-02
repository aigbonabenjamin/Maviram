import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { NextRequest } from "next/server";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.betterAuthUser,
      session: schema.betterAuthSession,
      account: schema.betterAuthAccount,
      verification: schema.betterAuthVerification,
    }
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [bearer()]
});

export async function getCurrentUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
