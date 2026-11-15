import "server-only";
import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import { accessStore, ACCESS_SCHEMA, type AdminDatabase } from "./admin-access";
import { makeAdminAuth } from "./admin-auth-factory";

const state = globalThis as typeof globalThis & {
  nfcAdminDb?: Promise<Kysely<AdminDatabase>>;
  nfcAdminSingleRoleMigration?: Promise<unknown>;
  nfcAdminAuthGoogle?: Promise<ReturnType<typeof makeAdminAuth>>;
  nfcAdminAuthGoogleConfigured?: boolean;
};

export function localAdminDatabase() {
  return !process.env.VERCEL && !process.env.VERCEL_ENV && process.env.NODE_ENV === "development" && Boolean(process.env.NFC_LOCAL_DATABASE);
}

export async function adminDatabase() {
  state.nfcAdminDb ??= (async () => {
    if (process.env.VERCEL_ENV === "preview") throw new Error("Admin auth is disabled in previews.");
    if (localAdminDatabase()) {
      const { KyselyPGlite } = await import("kysely-pglite");
      const { resolve } = await import("node:path");
      const { mkdir, chmod } = await import("node:fs/promises");
      const directory = resolve(".nfc-local-data/admin-auth");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await chmod(directory, 0o700);
      const local = await KyselyPGlite.create(directory);
      await local.client.exec(ACCESS_SCHEMA + "ALTER TABLE nfc_admin_access DROP COLUMN IF EXISTS role;");
      const db = new Kysely<AdminDatabase>({ dialect: local.dialect });
      const confirmed = process.env.NFC_LOCAL_ADMIN_EMAIL;
      if (confirmed) await accessStore(db).seedInitialAdmin(confirmed);
      return db;
    }
    if (!process.env.DATABASE_URL) throw new Error("Admin storage is not configured.");
    return new Kysely<AdminDatabase>({ dialect: new PostgresDialect({ pool: new Pool({
      connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 20_000,
    }) }) });
  })();
  const db = await state.nfcAdminDb;
  if (localAdminDatabase()) {
    state.nfcAdminSingleRoleMigration ??= sql`ALTER TABLE nfc_admin_access DROP COLUMN IF EXISTS role`.execute(db);
    await state.nfcAdminSingleRoleMigration;
  }
  return db;
}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getAdminAuth() {
  // Next reloads env files without clearing globalThis during development.
  // Rebuild auth when credentials become available after initial setup.
  const configured = googleConfigured();
  if (localAdminDatabase() && state.nfcAdminAuthGoogleConfigured !== configured) {
    state.nfcAdminAuthGoogle = undefined;
  }
  state.nfcAdminAuthGoogleConfigured = configured;
  state.nfcAdminAuthGoogle ??= (async () => {
    const db = await adminDatabase();
    const secret = process.env.NFC_AUTH_SECRET;
    const baseURL = process.env.NFC_AUTH_BASE_URL;
    if (!secret || secret.length < 32 || !baseURL) throw new Error("Admin sign-in is not configured.");
    if (!localAdminDatabase() && !baseURL.startsWith("https://")) throw new Error("Admin auth requires HTTPS.");
    const auth = makeAdminAuth({ db, secret, baseURL, google: googleConfigured() ? {
      clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    } : undefined });
    if (localAdminDatabase()) {
      const { getMigrations } = await import("better-auth/db/migration");
      await (await getMigrations(auth.options)).runMigrations();
    }
    return auth;
  })();
  return state.nfcAdminAuthGoogle;
}

export async function getAccessStore() {
  // Initialize local auth tables before membership changes can revoke sessions.
  await getAdminAuth();
  return accessStore(await adminDatabase());
}
