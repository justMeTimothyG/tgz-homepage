import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb, schema } from "@/db/client";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "pg", // PostgreSQL provider
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for admin user setup
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  basePath: "/api/auth", // Explicitly set base path
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;