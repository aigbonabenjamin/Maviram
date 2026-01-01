import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
 
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