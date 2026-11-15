import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import type { Kysely } from "kysely";
import { accessStore, type AdminDatabase } from "./admin-access.ts";

export function makeAdminAuth(config: {
  db: Kysely<AdminDatabase>; secret: string; baseURL: string;
  google?: { clientId: string; clientSecret: string };
}) {
  const store = accessStore(config.db);
  return betterAuth({
    appName: "Diggy Dash",
    secret: config.secret,
    baseURL: config.baseURL,
    basePath: "/api/nfc/auth",
    trustedOrigins: [new URL(config.baseURL).origin],
    database: { db: config.db, type: "postgres", transaction: true },
    user: { modelName: "nfc_auth_user" },
    session: { modelName: "nfc_auth_session", expiresIn: 8 * 60 * 60, cookieCache: { enabled: false } },
    account: { modelName: "nfc_auth_account" },
    verification: { modelName: "nfc_auth_verification" },
    rateLimit: { enabled: true, storage: "database", modelName: "nfc_auth_rate_limit" },
    advanced: {
      cookiePrefix: "diggy_admin",
      useSecureCookies: new URL(config.baseURL).protocol === "https:",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" },
      database: { generateId: () => crypto.randomUUID() },
    },
    emailAndPassword: { enabled: false },
    socialProviders: config.google ? { google: { ...config.google, prompt: "select_account" } } : {},
    databaseHooks: {
      user: { create: { before: async user => {
        if (!user.emailVerified || !await store.member(user.email)) throw new APIError("FORBIDDEN", { message: "Sign-in unavailable." });
      } } },
      session: { create: { before: async session => {
        const user = await config.db.selectFrom("nfc_auth_user").select(["email", "emailVerified"]).where("id", "=", session.userId).executeTakeFirst();
        if (!user?.emailVerified || !await store.member(user.email)) throw new APIError("FORBIDDEN", { message: "Sign-in unavailable." });
      } } },
    },
    logger: { disabled: true },
    telemetry: { enabled: false },
  });
}
